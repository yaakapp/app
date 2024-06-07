use std::collections::HashMap;

use sqlx::types::{Json, JsonValue};

use crate::models::{
    Environment, EnvironmentVariable, HttpRequest, HttpRequestHeader, HttpUrlParameter, Workspace,
};
use templates::parse_and_render;

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
    let mut variables = HashMap::new();
    variables = add_variable_to_map(variables, &workspace.variables.0);

    if let Some(e) = environment {
        variables = add_variable_to_map(variables, &e.variables.0);
    }

    parse_and_render(template, variables, None)
}

fn add_variable_to_map<'a>(
    m: HashMap<&'a str, &'a str>,
    variables: &'a Vec<EnvironmentVariable>,
) -> HashMap<&'a str, &'a str> {
    let mut map = m.clone();
    for variable in variables {
        if !variable.enabled || variable.value.is_empty() {
            continue;
        }
        let name = variable.name.as_str();
        let value = variable.value.as_str();
        map.insert(name, value);
    }

    map
}
