use tauri::regex::Regex;

use crate::models::Environment;

pub fn render(template: &str, environment: Environment) -> String {
    let variables = environment.data;
    Regex::new(r"\$\{\[\s*([^]\s]+)\s*]}")
        .expect("Failed to create regex")
        .replace(template, |caps: &tauri::regex::Captures| {
            let key = caps.get(1).unwrap().as_str();
            match variables.get(key) {
                Some(v) => {
                    if v.is_string() {
                        v.as_str().expect("Should be string").to_string()
                    } else {
                        v.to_string()
                    }
                }
                None => "".to_string(),
            }
        })
        .to_string()
}
