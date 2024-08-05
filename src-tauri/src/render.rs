use std::collections::HashMap;

use sqlx::types::JsonValue;

use crate::template_fns::timestamp;
use templates::parse_and_render;
use yaak_models::models::{
    Environment, EnvironmentVariable, HttpRequest, HttpRequestHeader, HttpUrlParameter, Workspace,
};

pub fn render_request(r: &HttpRequest, w: &Workspace, e: Option<&Environment>) -> HttpRequest {
    let r = r.clone();
    let vars = &variables_from_environment(w, e);

    HttpRequest {
        url: render(r.url.as_str(), vars),
        url_parameters: r
            .url_parameters
            .iter()
            .map(|p| HttpUrlParameter {
                enabled: p.enabled,
                name: render(p.name.as_str(), vars),
                value: render(p.value.as_str(), vars),
            })
            .collect::<Vec<HttpUrlParameter>>(),
        headers: r
            .headers
            .iter()
            .map(|p| HttpRequestHeader {
                enabled: p.enabled,
                name: render(p.name.as_str(), vars),
                value: render(p.value.as_str(), vars),
            })
            .collect::<Vec<HttpRequestHeader>>(),
        body: r
            .body
            .iter()
            .map(|(k, v)| {
                let v = if v.is_string() {
                    render(v.as_str().unwrap(), vars)
                } else {
                    v.to_string()
                };
                (render(k, vars), JsonValue::from(v))
            })
            .collect::<HashMap<String, JsonValue>>(),
        authentication: r
            .authentication
            .iter()
            .map(|(k, v)| {
                let v = if v.is_string() {
                    render(v.as_str().unwrap(), vars)
                } else {
                    v.to_string()
                };
                (render(k, vars), JsonValue::from(v))
            })
            .collect::<HashMap<String, JsonValue>>(),
        ..r
    }
}

pub fn recursively_render_variables<'s>(
    m: &HashMap<String, String>,
    render_count: usize,
) -> HashMap<String, String> {
    let mut did_render = false;
    let mut new_map = m.clone();
    for (k, v) in m.clone() {
        let rendered = render(v.as_str(), m);
        if rendered != v {
            did_render = true
        }
        new_map.insert(k, rendered);
    }

    if did_render && render_count <= 3 {
        new_map = recursively_render_variables(&new_map, render_count + 1);
    }

    new_map
}

pub fn variables_from_environment(
    workspace: &Workspace,
    environment: Option<&Environment>,
) -> HashMap<String, String> {
    let mut variables = HashMap::new();
    variables = add_variable_to_map(variables, &workspace.variables);

    if let Some(e) = environment {
        variables = add_variable_to_map(variables, &e.variables);
    }

    recursively_render_variables(&variables, 0)
}

pub fn render(template: &str, vars: &HashMap<String, String>) -> String {
    parse_and_render(template, vars, Some(template_callback))
}

fn template_callback(name: &str, args: HashMap<String, String>) -> Result<String, String> {
    match name {
        "timestamp" => timestamp(args),
        _ => Err(format!("Unknown template function {name}")),
    }
}

fn add_variable_to_map(
    m: HashMap<String, String>,
    variables: &Vec<EnvironmentVariable>,
) -> HashMap<String, String> {
    let mut map = m.clone();
    for variable in variables {
        if !variable.enabled || variable.value.is_empty() {
            continue;
        }
        let name = variable.name.as_str();
        let value = variable.value.as_str();
        map.insert(name.into(), value.into());
    }

    map
}
