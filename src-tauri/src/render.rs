use crate::models::{Environment, Workspace};
use std::collections::HashMap;
use tauri::regex::Regex;

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
        .replace_all(template, |caps: &tauri::regex::Captures| {
            let key = caps.get(1).unwrap().as_str();
            map.get(key).unwrap_or(&"")
        })
        .to_string()
}
