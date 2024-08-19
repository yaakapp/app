use crate::template_fns::timestamp;
use serde_json::Value;
use std::collections::HashMap;
use yaak_models::models::{
    Environment, EnvironmentVariable, HttpRequest, HttpRequestHeader, HttpUrlParameter, Workspace,
};
use yaak_templates::{parse_and_render, TemplateCallback};

pub async fn render_template(template: &str, w: &Workspace, e: Option<&Environment>) -> String {
    let vars = &variables_from_environment(w, e).await;
    render(template, vars).await
}

pub async fn render_request(
    r: &HttpRequest,
    w: &Workspace,
    e: Option<&Environment>,
) -> HttpRequest {
    let r = r.clone();
    let vars = &variables_from_environment(w, e).await;

    let mut url_parameters = Vec::new();
    for p in r.url_parameters {
        url_parameters.push(HttpUrlParameter {
            enabled: p.enabled,
            name: render(p.name.as_str(), vars).await,
            value: render(p.value.as_str(), vars).await,
        })
    }

    let mut headers = Vec::new();
    for p in r.headers {
        headers.push(HttpRequestHeader {
            enabled: p.enabled,
            name: render(p.name.as_str(), vars).await,
            value: render(p.value.as_str(), vars).await,
        })
    }

    let mut body = HashMap::new();
    for (k, v) in r.body {
        let v = if v.is_string() {
            render(v.as_str().unwrap(), vars).await
        } else {
            v.to_string()
        };
        body.insert(render(k.as_str(), vars).await, Value::from(v));
    }

    let mut authentication = HashMap::new();
    for (k, v) in r.authentication {
        let v = if v.is_string() {
            render(v.as_str().unwrap(), vars).await
        } else {
            v.to_string()
        };
        authentication.insert(render(k.as_str(), vars).await, Value::from(v));
    }

    HttpRequest {
        url: render(r.url.as_str(), vars).await,
        url_parameters,
        headers,
        body,
        authentication,
        ..r
    }
}

pub async fn recursively_render_variables<'s>(
    m: &HashMap<String, String>,
    render_count: usize,
) -> HashMap<String, String> {
    let mut did_render = false;
    let mut new_map = m.clone();
    for (k, v) in m.clone() {
        let rendered = Box::pin(render(v.as_str(), m)).await;
        if rendered != v {
            did_render = true
        }
        new_map.insert(k, rendered);
    }

    if did_render && render_count <= 3 {
        new_map = Box::pin(recursively_render_variables(&new_map, render_count + 1)).await;
    }

    new_map
}

pub async fn variables_from_environment(
    workspace: &Workspace,
    environment: Option<&Environment>,
) -> HashMap<String, String> {
    let mut variables = HashMap::new();
    variables = add_variable_to_map(variables, &workspace.variables);

    if let Some(e) = environment {
        variables = add_variable_to_map(variables, &e.variables);
    }

    recursively_render_variables(&variables, 0).await
}

pub async fn render(template: &str, vars: &HashMap<String, String>) -> String {
    parse_and_render(template, vars, &Box::new(PluginTemplateCallback::default())).await
}

#[derive(Default)]
struct PluginTemplateCallback {}

impl TemplateCallback for PluginTemplateCallback {
    async fn run(&self, fn_name: &str, args: HashMap<String, String>) -> Result<String, String> {
        match fn_name {
            "timestamp" => timestamp(args),
            _ => Err(format!("Unknown template function {fn_name}")),
        }
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
