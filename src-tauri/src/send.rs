use std::fs::{create_dir_all, File};
use std::io::Write;

use base64::Engine;
use http::{HeaderMap, HeaderName, HeaderValue, Method};
use http::header::{ACCEPT, USER_AGENT};
use log::warn;
use reqwest::redirect::Policy;
use sqlx::{Pool, Sqlite};
use sqlx::types::Json;
use tauri::{AppHandle, Wry};

use crate::{emit_side_effect, models, render, response_err};

pub async fn actually_send_request(
    request: models::HttpRequest,
    response: &models::HttpResponse,
    environment_id: &str,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
) -> Result<models::HttpResponse, String> {
    let start = std::time::Instant::now();
    let environment = models::get_environment(environment_id, pool).await.ok();
    let environment_ref = environment.as_ref();
    let workspace = models::get_workspace(&request.workspace_id, pool)
        .await
        .expect("Failed to get Workspace");

    let mut url_string = render::render(&request.url, &workspace, environment.as_ref());

    if !url_string.starts_with("http://") && !url_string.starts_with("https://") {
        url_string = format!("http://{}", url_string);
    }

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        // .danger_accept_invalid_certs(true)
        .build()
        .expect("Failed to build client");

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("yaak"));
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));

    for h in request.headers.0 {
        if h.name.is_empty() && h.value.is_empty() {
            continue;
        }

        if !h.enabled {
            continue;
        }

        let name = render::render(&h.name, &workspace, environment_ref);
        let value = render::render(&h.value, &workspace, environment_ref);

        let header_name = match HeaderName::from_bytes(name.as_bytes()) {
            Ok(n) => n,
            Err(e) => {
                eprintln!("Failed to create header name: {}", e);
                continue;
            }
        };
        let header_value = match HeaderValue::from_str(value.as_str()) {
            Ok(n) => n,
            Err(e) => {
                eprintln!("Failed to create header value: {}", e);
                continue;
            }
        };

        headers.insert(header_name, header_value);
    }

    if let Some(b) = &request.authentication_type {
        let empty_value = &serde_json::to_value("").unwrap();
        let a = request.authentication.0;

        if b == "basic" {
            let raw_username = a
                .get("username")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or("");
            let raw_password = a
                .get("password")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or("");
            let username = render::render(raw_username, &workspace, environment_ref);
            let password = render::render(raw_password, &workspace, environment_ref);

            let auth = format!("{username}:{password}");
            let encoded = base64::engine::general_purpose::STANDARD_NO_PAD.encode(auth);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Basic {}", encoded)).unwrap(),
            );
        } else if b == "bearer" {
            let raw_token = a.get("token").unwrap_or(empty_value).as_str().unwrap_or("");
            let token = render::render(raw_token, &workspace, environment_ref);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Bearer {token}")).unwrap(),
            );
        }
    }

    let m = Method::from_bytes(request.method.to_uppercase().as_bytes())
        .expect("Failed to create method");

    let mut request_builder = client.request(m, url_string.to_string()).headers(headers);

    let mut query_params = Vec::new();
    for p in request.url_parameters.0 {
        if !p.enabled || p.name.is_empty() { continue; }
        query_params.push((
            render::render(&p.name, &workspace, environment_ref),
            render::render(&p.value, &workspace, environment_ref),
        ));
    }
    request_builder = request_builder.query(&query_params);


    if let Some(t) = &request.body_type {
        let empty_string = &serde_json::to_value("").unwrap();
        let empty_bool = &serde_json::to_value(false).unwrap();
        let b = request.body.0;

        if b.contains_key("text") {
            let raw_text = b.get("text").unwrap_or(empty_string).as_str().unwrap_or("");
            let body = render::render(raw_text, &workspace, environment_ref);
            request_builder = request_builder.body(body);
        } else if b.contains_key("form") {
            let mut form_params = Vec::new();
            let form = b.get("form");
            if let Some(f) = form {
                for p in f.as_array().unwrap_or(&Vec::new()) {
                    let enabled = p.get("enabled").unwrap_or(empty_bool).as_bool().unwrap_or(false);
                    let name = p.get("name").unwrap_or(empty_string).as_str().unwrap_or_default();
                    let value = p.get("value").unwrap_or(empty_string).as_str().unwrap_or_default();
                    if !enabled || name.is_empty() { continue; }
                    form_params.push((
                        render::render(name, &workspace, environment_ref),
                        render::render(value, &workspace, environment_ref),
                    ));
                }
            }
            request_builder = request_builder.form(&form_params);
        } else {
            warn!("Unsupported body type: {}", t);
        }
    }

    let sendable_req = match request_builder.build() {
        Ok(r) => r,
        Err(e) => {
            return response_err(response, e.to_string(), app_handle, pool).await;
        }
    };

    let raw_response = client.execute(sendable_req).await;

    match raw_response {
        Ok(v) => {
            let mut response = response.clone();
            response.status = v.status().as_u16() as i64;
            response.status_reason = v.status().canonical_reason().map(|s| s.to_string());
            response.headers = Json(
                v.headers()
                    .iter()
                    .map(|(k, v)| models::HttpResponseHeader {
                        name: k.as_str().to_string(),
                        value: v.to_str().unwrap().to_string(),
                    })
                    .collect(),
            );
            response.url = v.url().to_string();
            let body_bytes = v.bytes().await.expect("Failed to get body").to_vec();
            response.content_length = Some(body_bytes.len() as i64);

            {
                // Write body to FS
                let dir = app_handle.path_resolver().app_data_dir().unwrap();
                let base_dir = dir.join("responses");
                create_dir_all(base_dir.clone()).expect("Failed to create responses dir");
                let body_path = match response.id.is_empty() {
                    false => base_dir.join(response.id.clone()),
                    true => base_dir.join(uuid::Uuid::new_v4().to_string()),
                };
                let mut f = File::options()
                    .create(true)
                    .truncate(true)
                    .write(true)
                    .open(&body_path)
                    .expect("Failed to open file");
                f.write_all(body_bytes.as_slice())
                    .expect("Failed to write to file");
                response.body_path = Some(
                    body_path
                        .to_str()
                        .expect("Failed to get body path")
                        .to_string(),
                );
            }

            // Also store body directly on the model, if small enough
            if body_bytes.len() < 100_000 {
                response.body = Some(body_bytes);
            }

            response.elapsed = start.elapsed().as_millis() as i64;
            response = models::update_response_if_id(&response, pool)
                .await
                .expect("Failed to update response");
            if !request.id.is_empty() {
                emit_side_effect(app_handle, "updated_model", &response);
            }
            Ok(response)
        }
        Err(e) => response_err(response, e.to_string(), app_handle, pool).await,
    }
}
