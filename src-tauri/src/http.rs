use std::fs::{create_dir_all, File};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use base64::Engine;
use http::{HeaderMap, HeaderName, HeaderValue, Method};
use http::header::{ACCEPT, USER_AGENT};
use log::{error, info, warn};
use reqwest::{multipart, Url};
use reqwest::redirect::Policy;
use sqlx::{Pool, Sqlite};
use sqlx::types::{Json, JsonValue};
use tauri::{AppHandle, Wry};

use crate::{emit_side_effect, models, render, response_err};

pub async fn send_http_request(
    request: models::HttpRequest,
    response: &models::HttpResponse,
    environment: Option<models::Environment>,
    cookie_jar: Option<models::CookieJar>,
    app_handle: &AppHandle<Wry>,
    pool: &Pool<Sqlite>,
    download_path: Option<PathBuf>,
) -> Result<models::HttpResponse, String> {
    let environment_ref = environment.as_ref();
    let workspace = models::get_workspace(&request.workspace_id, pool)
        .await
        .expect("Failed to get Workspace");

    let mut url_string = render::render(&request.url, &workspace, environment.as_ref());

    if !url_string.starts_with("http://") && !url_string.starts_with("https://") {
        url_string = format!("http://{}", url_string);
    }

    let mut client_builder = reqwest::Client::builder()
        .redirect(match workspace.setting_follow_redirects {
            true => Policy::limited(10), // TODO: Handle redirects natively
            false => Policy::none(),
        })
        .gzip(true)
        .brotli(true)
        .deflate(true)
        .referer(false)
        .danger_accept_invalid_certs(!workspace.setting_validate_certificates)
        .tls_info(true);

    // Add cookie store if specified
    let maybe_cookie_manager = match cookie_jar.clone() {
        Some(cj) => {
            // HACK: Can't construct Cookie without serde, so we have to do this
            let cookies = cj
                .cookies
                .0
                .iter()
                .map(|json_cookie| {
                    serde_json::from_value(json_cookie.clone())
                        .expect("Failed to deserialize cookie")
                })
                .map(|c| Ok(c))
                .collect::<Vec<Result<_, ()>>>();

            let store = reqwest_cookie_store::CookieStore::from_cookies(cookies, true)
                .expect("Failed to create cookie store");
            let cookie_store = reqwest_cookie_store::CookieStoreMutex::new(store);
            let cookie_store = Arc::new(cookie_store);
            client_builder = client_builder.cookie_provider(Arc::clone(&cookie_store));

            Some((cookie_store, cj))
        }
        None => None,
    };

    if workspace.setting_request_timeout > 0 {
        client_builder = client_builder.timeout(Duration::from_millis(
            workspace.setting_request_timeout.unsigned_abs(),
        ));
    }

    // .use_rustls_tls() // TODO: Make this configurable (maybe)
    let client = client_builder.build().expect("Failed to build client");

    let url = match Url::from_str(url_string.as_str()) {
        Ok(u) => u,
        Err(e) => {
            return response_err(response, e.to_string(), app_handle, pool).await;
        }
    };

    let m = Method::from_bytes(request.method.to_uppercase().as_bytes())
        .expect("Failed to create method");
    let mut request_builder = client.request(m, url.clone());

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("yaak"));
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));

    // TODO: Set cookie header ourselves once we also handle redirects. We need to do this
    //  because reqwest doesn't give us a way to inspect the headers it sent (we have to do
    //  everything manually to know that).
    // if let Some(cookie_store) = maybe_cookie_store.clone() {
    //     let values1 = cookie_store.get_request_values(&url);
    //     println!("COOKIE VLUAES: {:?}", values1.collect::<Vec<_>>());
    //     let raw_value = cookie_store.get_request_values(&url)
    //         .map(|(name, value)| format!("{}={}", name, value))
    //         .collect::<Vec<_>>()
    //         .join("; ");
    //     headers.insert(
    //         COOKIE,
    //         HeaderValue::from_str(&raw_value).expect("Failed to create cookie header"),
    //     );
    // }

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
                error!("Failed to create header name: {}", e);
                continue;
            }
        };
        let header_value = match HeaderValue::from_str(value.as_str()) {
            Ok(n) => n,
            Err(e) => {
                error!("Failed to create header value: {}", e);
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

    let mut query_params = Vec::new();
    for p in request.url_parameters.0 {
        if !p.enabled || p.name.is_empty() {
            continue;
        }
        query_params.push((
            render::render(&p.name, &workspace, environment_ref),
            render::render(&p.value, &workspace, environment_ref),
        ));
    }
    request_builder = request_builder.query(&query_params);

    if let Some(body_type) = &request.body_type {
        let empty_string = &serde_json::to_value("").unwrap();
        let empty_bool = &serde_json::to_value(false).unwrap();
        let request_body = request.body.0;

        if request_body.contains_key("text") {
            let raw_text = request_body
                .get("text")
                .unwrap_or(empty_string)
                .as_str()
                .unwrap_or("");
            let body = render::render(raw_text, &workspace, environment_ref);
            request_builder = request_builder.body(body);
        } else if body_type == "application/x-www-form-urlencoded"
            && request_body.contains_key("form")
        {
            let mut form_params = Vec::new();
            let form = request_body.get("form");
            if let Some(f) = form {
                for p in f.as_array().unwrap_or(&Vec::new()) {
                    let enabled = p
                        .get("enabled")
                        .unwrap_or(empty_bool)
                        .as_bool()
                        .unwrap_or(false);
                    let name = p
                        .get("name")
                        .unwrap_or(empty_string)
                        .as_str()
                        .unwrap_or_default();
                    if !enabled || name.is_empty() {
                        continue;
                    }
                    let value = p
                        .get("value")
                        .unwrap_or(empty_string)
                        .as_str()
                        .unwrap_or_default();
                    form_params.push((
                        render::render(name, &workspace, environment_ref),
                        render::render(value, &workspace, environment_ref),
                    ));
                }
            }
            request_builder = request_builder.form(&form_params);
        } else if body_type == "multipart/form-data" && request_body.contains_key("form") {
            let mut multipart_form = multipart::Form::new();
            if let Some(form_definition) = request_body.get("form") {
                for p in form_definition.as_array().unwrap_or(&Vec::new()) {
                    let enabled = p
                        .get("enabled")
                        .unwrap_or(empty_bool)
                        .as_bool()
                        .unwrap_or(false);
                    let name = p
                        .get("name")
                        .unwrap_or(empty_string)
                        .as_str()
                        .unwrap_or_default();
                    if !enabled || name.is_empty() {
                        continue;
                    }

                    let file = p
                        .get("file")
                        .unwrap_or(empty_string)
                        .as_str()
                        .unwrap_or_default();
                    let value = p
                        .get("value")
                        .unwrap_or(empty_string)
                        .as_str()
                        .unwrap_or_default();
                    multipart_form = multipart_form.part(
                        render::render(name, &workspace, environment_ref),
                        match !file.is_empty() {
                            true => {
                                multipart::Part::bytes(fs::read(file).map_err(|e| e.to_string())?)
                            }
                            false => multipart::Part::text(render::render(
                                value,
                                &workspace,
                                environment_ref,
                            )),
                        },
                    );
                }
            }
            headers.remove("Content-Type"); // reqwest will add this automatically
            request_builder = request_builder.multipart(multipart_form);
        } else {
            warn!("Unsupported body type: {}", body_type);
        }
    }

    // Add headers last, because previous steps may modify them
    request_builder = request_builder.headers(headers);

    let sendable_req = match request_builder.build() {
        Ok(r) => r,
        Err(e) => {
            return response_err(response, e.to_string(), app_handle, pool).await;
        }
    };

    let start = std::time::Instant::now();
    let raw_response = client.execute(sendable_req).await;

    match raw_response {
        Ok(v) => {
            let mut response = response.clone();
            response.elapsed_headers = start.elapsed().as_millis() as i64;
            let response_headers = v.headers().clone();
            response.status = v.status().as_u16() as i64;
            response.status_reason = v.status().canonical_reason().map(|s| s.to_string());
            response.headers = Json(
                response_headers
                    .iter()
                    .map(|(k, v)| models::HttpResponseHeader {
                        name: k.as_str().to_string(),
                        value: v.to_str().unwrap().to_string(),
                    })
                    .collect(),
            );
            response.url = v.url().to_string();
            response.remote_addr = v.remote_addr().map(|a| a.to_string());
            response.version = match v.version() {
                http::Version::HTTP_09 => Some("HTTP/0.9".to_string()),
                http::Version::HTTP_10 => Some("HTTP/1.0".to_string()),
                http::Version::HTTP_11 => Some("HTTP/1.1".to_string()),
                http::Version::HTTP_2 => Some("HTTP/2".to_string()),
                http::Version::HTTP_3 => Some("HTTP/3".to_string()),
                _ => None,
            };

            let content_length = v.content_length();
            let body_bytes = v.bytes().await.expect("Failed to get body").to_vec();
            response.elapsed = start.elapsed().as_millis() as i64;

            // Use content length if available, otherwise use body length
            response.content_length = match content_length {
                Some(l) => Some(l as i64),
                None => Some(body_bytes.len() as i64),
            };

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

            response = models::update_response_if_id(&response, pool)
                .await
                .expect("Failed to update response");
            if !request.id.is_empty() {
                emit_side_effect(app_handle, "updated_model", &response);
            }

            // Copy response to download path, if specified
            match (download_path, response.body_path.clone()) {
                (Some(dl_path), Some(body_path)) => {
                    info!("Downloading response body to {}", dl_path.display());
                    fs::copy(body_path, dl_path)
                        .expect("Failed to copy file for response download");
                }
                _ => {}
            };

            // Add cookie store if specified
            if let Some((cookie_store, mut cookie_jar)) = maybe_cookie_manager {
                // let cookies = response_headers.get_all(SET_COOKIE).iter().map(|h| {
                //     println!("RESPONSE COOKIE: {}", h.to_str().unwrap());
                //     cookie_store::RawCookie::from_str(h.to_str().unwrap())
                //         .expect("Failed to parse cookie")
                // });
                // store.store_response_cookies(cookies, &url);

                let json_cookies: Json<Vec<JsonValue>> = Json(
                    cookie_store
                        .lock()
                        .unwrap()
                        .iter_any()
                        .map(|c| serde_json::to_value(&c).expect("Failed to serialize cookie"))
                        .collect::<Vec<_>>(),
                );
                cookie_jar.cookies = json_cookies;
                match models::upsert_cookie_jar(pool, &cookie_jar).await {
                    Ok(updated_jar) => {
                        emit_side_effect(app_handle, "updated_model", &updated_jar);
                    }
                    Err(e) => {
                        error!("Failed to update cookie jar: {}", e);
                    }
                };
            }

            Ok(response)
        }
        Err(e) => response_err(response, e.to_string(), app_handle, pool).await,
    }
}
