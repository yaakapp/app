use crate::models::Environment;
use std::collections::HashMap;
use tauri::regex::Regex;

pub fn render(template: &str, environment: Option<&Environment>) -> String {
    match environment {
        Some(environment) => render_with_environment(template, environment),
        None => template.to_string(),
    }
}

fn render_with_environment(template: &str, environment: &Environment) -> String {
    let mut map = HashMap::new();
    let variables = &environment.variables.0;
    for variable in variables {
        if !variable.enabled {
            continue;
        }
        map.insert(variable.name.as_str(), variable.value.as_str());
    }

    Regex::new(r"\$\{\[\s*([^]\s]+)\s*]}")
        .expect("Failed to create regex")
        .replace_all(template, |caps: &tauri::regex::Captures| {
            let key = caps.get(1).unwrap().as_str();
            map.get(key).unwrap_or(&"")
        })
        .to_string()
}
