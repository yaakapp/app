use std::collections::BTreeMap;
use std::fs;
use std::fs::{create_dir_all, File};
use std::io::Write;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use crate::render::render_http_request;
use crate::response_err;
use crate::template_callback::PluginTemplateCallback;
use base64::prelude::BASE64_STANDARD;
use base64::Engine;
use http::header::{ACCEPT, USER_AGENT};
use http::{HeaderMap, HeaderName, HeaderValue};
use log::{error, warn};
use mime_guess::Mime;
use reqwest::redirect::Policy;
use reqwest::Method;
use reqwest::{multipart, Url};
use serde_json::Value;
use tauri::{Manager, Runtime, WebviewWindow};
use tokio::sync::oneshot;
use tokio::sync::watch::Receiver;
use yaak_models::models::{
    Cookie, CookieJar, Environment, HttpRequest, HttpResponse, HttpResponseHeader, HttpUrlParameter,
};
use yaak_models::queries::{get_workspace, update_response_if_id, upsert_cookie_jar};

pub async fn send_http_request<R: Runtime>(
    window: &WebviewWindow<R>,
    request: &HttpRequest,
    response: &HttpResponse,
    environment: Option<Environment>,
    cookie_jar: Option<CookieJar>,
    cancel_rx: &mut Receiver<bool>,
) -> Result<HttpResponse, String> {
    let workspace = get_workspace(window, &request.workspace_id)
        .await
        .expect("Failed to get Workspace");
    let cb = &*window.app_handle().state::<PluginTemplateCallback>();
    let cb = cb.for_send();
    let rendered_request =
        render_http_request(&request, &workspace, environment.as_ref(), &cb).await;

    let mut url_string = rendered_request.url;

    url_string = ensure_proto(&url_string);
    if !url_string.starts_with("http://") && !url_string.starts_with("https://") {
        url_string = format!("http://{}", url_string);
    }

    let mut client_builder = reqwest::Client::builder()
        .redirect(match workspace.setting_follow_redirects {
            true => Policy::limited(10), // TODO: Handle redirects natively
            false => Policy::none(),
        })
        .connection_verbose(true)
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
                .iter()
                .map(|cookie| {
                    let json_cookie = serde_json::to_value(cookie).unwrap();
                    serde_json::from_value(json_cookie).expect("Failed to deserialize cookie")
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
            workspace.setting_request_timeout.unsigned_abs() as u64,
        ));
    }

    let client = client_builder.build().expect("Failed to build client");

    // Render query parameters
    let mut query_params = Vec::new();
    for p in rendered_request.url_parameters {
        if !p.enabled || p.name.is_empty() {
            continue;
        }

        // Replace path parameters with values from URL parameters
        let old_url_string = url_string.clone();
        url_string = replace_path_placeholder(&p, url_string.as_str());

        // Treat as regular param if wasn't used as path param
        if old_url_string == url_string {
            query_params.push((p.name, p.value));
        }
    }

    let uri = match http::Uri::from_str(url_string.as_str()) {
        Ok(u) => u,
        Err(e) => {
            return response_err(
                response,
                format!("Failed to parse URL \"{}\": {}", url_string, e.to_string()),
                window,
            )
            .await;
        }
    };
    // Yes, we're parsing both URI and URL because they could return different errors
    let url = match Url::from_str(uri.to_string().as_str()) {
        Ok(u) => u,
        Err(e) => {
            return response_err(
                response,
                format!("Failed to parse URL \"{}\": {}", url_string, e.to_string()),
                window,
            )
            .await;
        }
    };

    let m = Method::from_bytes(rendered_request.method.to_uppercase().as_bytes())
        .expect("Failed to create method");
    let mut request_builder = client.request(m, url).query(&query_params);

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("yaak"));
    headers.insert(ACCEPT, HeaderValue::from_static("*/*"));

    // TODO: Set cookie header ourselves once we also handle redirects. We need to do this
    //  because reqwest doesn't give us a way to inspect the headers it sent (we have to do
    //  everything manually to know that).
    // if let Some(cookie_store) = maybe_cookie_store.clone() {
    //     let values1 = cookie_store.get_request_values(&url);
    //     let raw_value = cookie_store.get_request_values(&url)
    //         .map(|(name, value)| format!("{}={}", name, value))
    //         .collect::<Vec<_>>()
    //         .join("; ");
    //     headers.insert(
    //         COOKIE,
    //         HeaderValue::from_str(&raw_value).expect("Failed to create cookie header"),
    //     );
    // }

    for h in rendered_request.headers {
        if h.name.is_empty() && h.value.is_empty() {
            continue;
        }

        if !h.enabled {
            continue;
        }

        let header_name = match HeaderName::from_bytes(h.name.as_bytes()) {
            Ok(n) => n,
            Err(e) => {
                error!("Failed to create header name: {}", e);
                continue;
            }
        };
        let header_value = match HeaderValue::from_str(h.value.as_str()) {
            Ok(n) => n,
            Err(e) => {
                error!("Failed to create header value: {}", e);
                continue;
            }
        };

        headers.insert(header_name, header_value);
    }

    if let Some(b) = &rendered_request.authentication_type {
        let empty_value = &serde_json::to_value("").unwrap();
        let a = rendered_request.authentication;

        if b == "basic" {
            let username = a
                .get("username")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or_default();
            let password = a
                .get("password")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or_default();

            let auth = format!("{username}:{password}");
            let encoded = BASE64_STANDARD.encode(auth);
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Basic {}", encoded)).unwrap(),
            );
        } else if b == "bearer" {
            let token = a
                .get("token")
                .unwrap_or(empty_value)
                .as_str()
                .unwrap_or_default();
            headers.insert(
                "Authorization",
                HeaderValue::from_str(&format!("Bearer {token}")).unwrap(),
            );
        }
    }

    let request_body = rendered_request.body;
    if let Some(body_type) = &rendered_request.body_type {
        if request_body.contains_key("text") {
            let body = get_str_h(&request_body, "text");
            request_builder = request_builder.body(body.to_owned());
        } else if body_type == "application/x-www-form-urlencoded"
            && request_body.contains_key("form")
        {
            let mut form_params = Vec::new();
            let form = request_body.get("form");
            if let Some(f) = form {
                match f.as_array() {
                    None => {}
                    Some(a) => {
                        for p in a {
                            let enabled = get_bool(p, "enabled");
                            let name = get_str(p, "name");
                            if !enabled || name.is_empty() {
                                continue;
                            }
                            let value = get_str(p, "value");
                            form_params.push((name, value));
                        }
                    }
                }
            }
            request_builder = request_builder.form(&form_params);
        } else if body_type == "binary" && request_body.contains_key("filePath") {
            let file_path = request_body
                .get("filePath")
                .ok_or("filePath not set")?
                .as_str()
                .unwrap_or_default();

            match fs::read(file_path).map_err(|e| e.to_string()) {
                Ok(f) => {
                    request_builder = request_builder.body(f);
                }
                Err(e) => {
                    return response_err(response, e, window).await;
                }
            }
        } else if body_type == "multipart/form-data" && request_body.contains_key("form") {
            let mut multipart_form = multipart::Form::new();
            if let Some(form_definition) = request_body.get("form") {
                match form_definition.as_array() {
                    None => {}
                    Some(fd) => {
                        for p in fd {
                            let enabled = get_bool(p, "enabled");
                            let name = get_str(p, "name").to_string();

                            if !enabled || name.is_empty() {
                                continue;
                            }

                            let file_path = get_str(p, "file").to_owned();
                            let value = get_str(p, "value").to_owned();

                            let mut part = if file_path.is_empty() {
                                multipart::Part::text(value.clone())
                            } else {
                                match fs::read(file_path.clone()) {
                                    Ok(f) => multipart::Part::bytes(f),
                                    Err(e) => {
                                        return response_err(response, e.to_string(), window).await;
                                    }
                                }
                            };

                            let content_type = get_str(p, "contentType");

                            // Set or guess mimetype
                            if !content_type.is_empty() {
                                part = part.mime_str(content_type).map_err(|e| e.to_string())?;
                            } else if !file_path.is_empty() {
                                let default_mime =
                                    Mime::from_str("application/octet-stream").unwrap();
                                let mime =
                                    mime_guess::from_path(file_path.clone()).first_or(default_mime);
                                part = part
                                    .mime_str(mime.essence_str())
                                    .map_err(|e| e.to_string())?;
                            }

                            // Set file path if not empty
                            if !file_path.is_empty() {
                                let filename = PathBuf::from(file_path)
                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .to_string();
                                part = part.file_name(filename);
                            }

                            multipart_form = multipart_form.part(name, part);
                        }
                    }
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
            return response_err(response, e.to_string(), window).await;
        }
    };

    let start = std::time::Instant::now();

    let (resp_tx, resp_rx) = oneshot::channel();

    tokio::spawn(async move {
        let _ = resp_tx.send(client.execute(sendable_req).await);
    });

    let raw_response = tokio::select! {
        Ok(r) = resp_rx => {r}
        _ = cancel_rx.changed() => {
            return response_err(response, "Request was cancelled".to_string(), window).await;
        }
    };

    match raw_response {
        Ok(v) => {
            let mut response = response.clone();
            response.elapsed_headers = start.elapsed().as_millis() as i32;
            let response_headers = v.headers().clone();
            response.status = v.status().as_u16() as i32;
            response.status_reason = v.status().canonical_reason().map(|s| s.to_string());
            response.headers = response_headers
                .iter()
                .map(|(k, v)| HttpResponseHeader {
                    name: k.as_str().to_string(),
                    value: v.to_str().unwrap_or_default().to_string(),
                })
                .collect();
            response.url = v.url().to_string();
            response.remote_addr = v.remote_addr().map(|a| a.to_string());
            response.version = match v.version() {
                reqwest::Version::HTTP_09 => Some("HTTP/0.9".to_string()),
                reqwest::Version::HTTP_10 => Some("HTTP/1.0".to_string()),
                reqwest::Version::HTTP_11 => Some("HTTP/1.1".to_string()),
                reqwest::Version::HTTP_2 => Some("HTTP/2".to_string()),
                reqwest::Version::HTTP_3 => Some("HTTP/3".to_string()),
                _ => None,
            };

            let content_length = v.content_length();
            let body_bytes = v.bytes().await.expect("Failed to get body").to_vec();
            response.elapsed = start.elapsed().as_millis() as i32;

            // Use content length if available, otherwise use body length
            response.content_length = match content_length {
                Some(l) => Some(l as i32),
                None => Some(body_bytes.len() as i32),
            };

            {
                // Write body to FS
                let dir = window.app_handle().path().app_data_dir().unwrap();
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

            response = update_response_if_id(window, &response)
                .await
                .expect("Failed to update response");

            // Add cookie store if specified
            if let Some((cookie_store, mut cookie_jar)) = maybe_cookie_manager {
                // let cookies = response_headers.get_all(SET_COOKIE).iter().map(|h| {
                //     println!("RESPONSE COOKIE: {}", h.to_str().unwrap());
                //     cookie_store::RawCookie::from_str(h.to_str().unwrap())
                //         .expect("Failed to parse cookie")
                // });
                // store.store_response_cookies(cookies, &url);

                let json_cookies: Vec<Cookie> = cookie_store
                    .lock()
                    .unwrap()
                    .iter_any()
                    .map(|c| {
                        let json_cookie =
                            serde_json::to_value(&c).expect("Failed to serialize cookie");
                        serde_json::from_value(json_cookie).expect("Failed to deserialize cookie")
                    })
                    .collect::<Vec<_>>();
                cookie_jar.cookies = json_cookies;
                if let Err(e) = upsert_cookie_jar(window, &cookie_jar).await {
                    error!("Failed to update cookie jar: {}", e);
                };
            }

            Ok(response)
        }
        Err(e) => response_err(response, e.to_string(), window).await,
    }
}

fn ensure_proto(url_str: &str) -> String {
    if url_str.starts_with("http://") || url_str.starts_with("https://") {
        return url_str.to_string();
    }

    // Url::from_str will fail without a proto, so add one
    let parseable_url = format!("http://{}", url_str);
    if let Ok(u) = Url::from_str(parseable_url.as_str()) {
        match u.host() {
            Some(host) => {
                let h = host.to_string();
                // These TLDs force HTTPS
                if h.ends_with(".app") || h.ends_with(".dev") || h.ends_with(".page") {
                    return format!("https://{url_str}");
                }
            }
            None => {}
        }
    }

    format!("http://{url_str}")
}

fn get_bool(v: &Value, key: &str) -> bool {
    match v.get(key) {
        None => false,
        Some(v) => v.as_bool().unwrap_or_default(),
    }
}

fn get_str<'a>(v: &'a Value, key: &str) -> &'a str {
    match v.get(key) {
        None => "",
        Some(v) => v.as_str().unwrap_or_default(),
    }
}

fn get_str_h<'a>(v: &'a BTreeMap<String, Value>, key: &str) -> &'a str {
    match v.get(key) {
        None => "",
        Some(v) => v.as_str().unwrap_or_default(),
    }
}

fn replace_path_placeholder(p: &HttpUrlParameter, url: &str) -> String {
    if !p.enabled {
        return url.to_string();
    }
    
    if !p.name.starts_with(":") {
        return url.to_string();
    }

    let re = regex::Regex::new(format!("(/){}([/?#]|$)", p.name).as_str()).unwrap();
    let result = re
        .replace_all(url, |cap: &regex::Captures| {
            format!(
                "{}{}{}",
                cap[1].to_string(),
                urlencoding::encode(p.value.as_str()),
                cap[2].to_string()
            )
        })
        .into_owned();
    result
}

#[cfg(test)]
mod tests {
    use crate::http_request::replace_path_placeholder;
    use yaak_models::models::HttpUrlParameter;

    #[test]
    fn placeholder_middle() {
        let p = HttpUrlParameter {
            name: ":foo".into(),
            value: "xxx".into(),
            enabled: true,
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foo/bar"),
            "https://example.com/xxx/bar",
        );
    }

    #[test]
    fn placeholder_end() {
        let p = HttpUrlParameter {
            name: ":foo".into(),
            value: "xxx".into(),
            enabled: true,
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foo"),
            "https://example.com/xxx",
        );
    }

    #[test]
    fn placeholder_query() {
        let p = HttpUrlParameter {
            name: ":foo".into(),
            value: "xxx".into(),
            enabled: true,
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foo?:foo"),
            "https://example.com/xxx?:foo",
        );
    }

    #[test]
    fn placeholder_missing() {
        let p = HttpUrlParameter {
            enabled: true,
            name: "".to_string(),
            value: "".to_string(),
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:missing"),
            "https://example.com/:missing",
        );
    }

    #[test]
    fn placeholder_disabled() {
        let p = HttpUrlParameter {
            enabled: false,
            name: ":foo".to_string(),
            value: "xxx".to_string(),
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foo"),
            "https://example.com/:foo",
        );
    }

    #[test]
    fn placeholder_prefix() {
        let p = HttpUrlParameter {
            name: ":foo".into(),
            value: "xxx".into(),
            enabled: true,
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foooo"),
            "https://example.com/:foooo",
        );
    }

    #[test]
    fn placeholder_encode() {
        let p = HttpUrlParameter {
            name: ":foo".into(),
            value: "Hello World".into(),
            enabled: true,
        };
        assert_eq!(
            replace_path_placeholder(&p, "https://example.com/:foo"),
            "https://example.com/Hello%20World",
        );
    }
}
