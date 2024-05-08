use std::collections::HashMap;

use regex::Regex;
use sqlx::types::{Json, JsonValue};

use crate::models::{Environment, HttpRequest, HttpRequestHeader, HttpUrlParameter, Workspace};

pub fn render_request(r: &HttpRequest, w: &Workspace, e: Option<&Environment>) -> HttpRequest {
    let r = r.clone();
    HttpRequest {
        url: render(r.url.as_str(), w, e),
        url_parameters: Json(
            r.url_parameters
                .0
                .iter()
                .map(|p| HttpUrlParameter {
                    enabled: p.enabled,
                    name: render(p.name.as_str(), w, e),
                    value: render(p.value.as_str(), w, e),
                })
                .collect::<Vec<HttpUrlParameter>>(),
        ),
        headers: Json(
            r.headers
                .0
                .iter()
                .map(|p| HttpRequestHeader {
                    enabled: p.enabled,
                    name: render(p.name.as_str(), w, e),
                    value: render(p.value.as_str(), w, e),
                })
                .collect::<Vec<HttpRequestHeader>>(),
        ),
        body: Json(
            r.body
                .0
                .iter()
                .map(|(k, v)| {
                    let v = if v.is_string() {
                        render(v.as_str().unwrap(), w, e)
                    } else {
                        v.to_string()
                    };
                    (render(k, w, e), JsonValue::from(v))
                })
                .collect::<HashMap<String, JsonValue>>(),
        ),
        authentication: Json(
            r.authentication
                .0
                .iter()
                .map(|(k, v)| {
                    let v = if v.is_string() {
                        render(v.as_str().unwrap(), w, e)
                    } else {
                        v.to_string()
                    };
                    (render(k, w, e), JsonValue::from(v))
                })
                .collect::<HashMap<String, JsonValue>>(),
        ),
        ..r
    }
}

pub fn render(template: &str, workspace: &Workspace, environment: Option<&Environment>) -> String {
    let mut map = HashMap::new();
    let workspace_variables = &workspace.variables.0;
    for variable in workspace_variables {
        if !variable.enabled || variable.value.is_empty() {
            continue;
        }
        map.insert(variable.name.as_str(), variable.value.as_str());
    }

    if let Some(e) = environment {
        let environment_variables = &e.variables.0;
        for variable in environment_variables {
            if !variable.enabled || variable.value.is_empty() {
                continue;
            }
            map.insert(variable.name.as_str(), variable.value.as_str());
        }
    }

    Regex::new(r"\$\{\[\s*([^]\s]+)\s*]}")
        .expect("Failed to create regex")
        .replace_all(template, |caps: &regex::Captures| {
            let key = caps.get(1).unwrap().as_str();
            map.get(key).unwrap_or(&"")
        })
        .to_string()
}
