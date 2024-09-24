use crate::template_callback::PluginTemplateCallback;
use serde_json::{json, Map, Value};
use std::collections::{BTreeMap, HashMap};
use tauri::{AppHandle, Manager, Runtime};
use yaak_models::models::{
    Environment, EnvironmentVariable, GrpcMetadataEntry, GrpcRequest, HttpRequest,
    HttpRequestHeader, HttpUrlParameter, Workspace,
};
use yaak_templates::{parse_and_render, TemplateCallback};

pub async fn render_template<R: Runtime>(
    app_handle: &AppHandle<R>,
    template: &str,
    w: &Workspace,
    e: Option<&Environment>,
) -> String {
    let cb = &*app_handle.state::<PluginTemplateCallback>();
    let vars = &make_vars_hashmap(w, e);
    render(template, vars, cb).await
}

pub async fn render_grpc_request<R: Runtime>(
    app_handle: &AppHandle<R>,
    r: &GrpcRequest,
    w: &Workspace,
    e: Option<&Environment>,
) -> GrpcRequest {
    let cb = &*app_handle.state::<PluginTemplateCallback>();
    let vars = &make_vars_hashmap(w, e);

    let mut metadata = Vec::new();
    for p in r.metadata.clone() {
        metadata.push(GrpcMetadataEntry {
            enabled: p.enabled,
            name: render(p.name.as_str(), vars, cb).await,
            value: render(p.value.as_str(), vars, cb).await,
        })
    }

    let mut authentication = BTreeMap::new();
    for (k, v) in r.authentication.clone() {
        authentication.insert(k, render_json_value(v, vars, cb).await);
    }

    let url = render(r.url.as_str(), vars, cb).await;

    GrpcRequest {
        url,
        metadata,
        authentication,
        ..r.to_owned()
    }
}

pub async fn render_http_request(
    r: &HttpRequest,
    w: &Workspace,
    e: Option<&Environment>,
    cb: &PluginTemplateCallback,
) -> HttpRequest {
    let vars = &make_vars_hashmap(w, e);

    let mut url_parameters = Vec::new();
    for p in r.url_parameters.clone() {
        url_parameters.push(HttpUrlParameter {
            enabled: p.enabled,
            name: render(p.name.as_str(), vars, cb).await,
            value: render(p.value.as_str(), vars, cb).await,
        })
    }

    let mut headers = Vec::new();
    for p in r.headers.clone() {
        headers.push(HttpRequestHeader {
            enabled: p.enabled,
            name: render(p.name.as_str(), vars, cb).await,
            value: render(p.value.as_str(), vars, cb).await,
        })
    }

    let mut body = BTreeMap::new();
    for (k, v) in r.body.clone() {
        body.insert(k, render_json_value(v, vars, cb).await);
    }

    let mut authentication = BTreeMap::new();
    for (k, v) in r.authentication.clone() {
        authentication.insert(k, render_json_value(v, vars, cb).await);
    }

    let url = render(r.url.clone().as_str(), vars, cb).await;
    HttpRequest {
        url,
        url_parameters,
        headers,
        body,
        authentication,
        ..r.to_owned()
    }
}

pub fn make_vars_hashmap(
    workspace: &Workspace,
    environment: Option<&Environment>,
) -> HashMap<String, String> {
    let mut variables = HashMap::new();
    variables = add_variable_to_map(variables, &workspace.variables);

    if let Some(e) = environment {
        variables = add_variable_to_map(variables, &e.variables);
    }

    variables
}

pub async fn render<T: TemplateCallback>(
    template: &str,
    vars: &HashMap<String, String>,
    cb: &T,
) -> String {
    parse_and_render(template, vars, cb).await
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

pub async fn render_json_value<T: TemplateCallback>(
    v: Value,
    vars: &HashMap<String, String>,
    cb: &T,
) -> Value {
    match v {
        Value::String(s) => json!(render(s.as_str(), vars, cb).await),
        Value::Array(a) => {
            let mut new_a = Vec::new();
            for v in a {
                new_a.push(Box::pin(render_json_value(v, vars, cb)).await)
            }
            json!(new_a)
        }
        Value::Object(o) => {
            let mut new_o = Map::new();
            for (k, v) in o {
                let key = Box::pin(render(k.as_str(), vars, cb)).await;
                let value = Box::pin(render_json_value(v, vars, cb)).await;
                new_o.insert(key, value);
            }
            json!(new_o)
        }
        v => v,
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;
    use std::collections::HashMap;
    use yaak_templates::TemplateCallback;

    struct EmptyCB {}

    impl TemplateCallback for EmptyCB {
        async fn run(
            &self,
            _fn_name: &str,
            _args: HashMap<String, String>,
        ) -> Result<String, String> {
            todo!()
        }
    }

    #[tokio::test]
    async fn render_json_value_string() {
        let v = json!("${[a]}");
        let mut vars = HashMap::new();
        vars.insert("a".to_string(), "aaa".to_string());

        let result = super::render_json_value(v, &vars, &EmptyCB {}).await;
        assert_eq!(result, json!("aaa"))
    }

    #[tokio::test]
    async fn render_json_value_array() {
        let v = json!(["${[a]}", "${[a]}"]);
        let mut vars = HashMap::new();
        vars.insert("a".to_string(), "aaa".to_string());

        let result = super::render_json_value(v, &vars, &EmptyCB {}).await;
        assert_eq!(result, json!(["aaa", "aaa"]))
    }

    #[tokio::test]
    async fn render_json_value_object() {
        let v = json!({"${[a]}": "${[a]}"});
        let mut vars = HashMap::new();
        vars.insert("a".to_string(), "aaa".to_string());

        let result = super::render_json_value(v, &vars, &EmptyCB {}).await;
        assert_eq!(result, json!({"aaa": "aaa"}))
    }

    #[tokio::test]
    async fn render_json_value_nested() {
        let v = json!([
            123,
            {"${[a]}": "${[a]}"},
            null,
            "${[a]}",
            false,
            {"x": ["${[a]}"]}
        ]);
        let mut vars = HashMap::new();
        vars.insert("a".to_string(), "aaa".to_string());

        let result = super::render_json_value(v, &vars, &EmptyCB {}).await;
        assert_eq!(
            result,
            json!([
                123,
                {"aaa": "aaa"},
                null,
                "aaa",
                false,
                {"x": ["aaa"]}
            ])
        )
    }
}
