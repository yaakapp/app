#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::rc::Rc;

use deno_ast::MediaType;
use deno_ast::ParseParams;
use deno_ast::SourceTextInfo;
use deno_core::error::AnyError;
use deno_core::futures::FutureExt;
use deno_core::ModuleSource;
use deno_core::ModuleType;
use deno_core::RuntimeOptions;
use deno_core::{Extension, JsRuntime};
use futures::executor;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(serde::Serialize)]
struct CustomResponse {
    status: String,
    body: String,
    elapsed: u128,
    elapsed2: u128,
    url: String,
}

async fn run_plugin(file_path: &str) -> Result<(), AnyError> {
    let extension = Extension::builder("runjs").ops(vec![]).build();

    // Initialize a runtime instance
    let mut runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(TsModuleLoader)),
        extensions: vec![extension],
        ..Default::default()
    });

    let main_module = deno_core::resolve_path(file_path)?;
    let mod_id = runtime.load_main_module(&main_module, None).await?;
    let result = runtime.mod_evaluate(mod_id);
    runtime.run_event_loop(false).await?;
    result.await?
}

#[tauri::command]
async fn send_request(url: &str) -> Result<CustomResponse, String> {
    let start = std::time::Instant::now();

    let mut abs_url = url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", url);
    }

    let resp = reqwest::get(abs_url.to_string()).await;
    let elapsed = start.elapsed().as_millis();

    let result = executor::block_on(run_plugin(
        "/Users/gschier/Workspace/tauri-app/plugins/plugin.ts",
    ));
    if let Err(e) = result {
        eprintln!("Error running plugin: {}", e);
    }

    match resp {
        Ok(v) => {
            let url2 = v.url().to_string();
            let status = v.status().to_string();
            let body = v.text().await.unwrap();
            let elapsed2 = start.elapsed().as_millis();
            Ok(CustomResponse {
                status,
                body,
                elapsed,
                elapsed2,
                url: url2,
            })
        }
        Err(e) => Err(e.to_string()),
    }
}

struct TsModuleLoader;

impl deno_core::ModuleLoader for TsModuleLoader {
    fn resolve(
        &self,
        specifier: &str,
        referrer: &str,
        _kind: deno_core::ResolutionKind,
    ) -> Result<deno_core::ModuleSpecifier, AnyError> {
        deno_core::resolve_import(specifier, referrer).map_err(|e| e.into())
    }

    fn load(
        &self,
        module_specifier: &deno_core::ModuleSpecifier,
        _maybe_referrer: Option<deno_core::ModuleSpecifier>,
        _is_dyn_import: bool,
    ) -> std::pin::Pin<Box<deno_core::ModuleSourceFuture>> {
        let module_specifier = module_specifier.clone();
        async move {
            let path = module_specifier.to_file_path().unwrap();

            // Determine what the MediaType is (this is done based on the file
            // extension) and whether transpiling is required.
            let media_type = MediaType::from(&path);
            let (module_type, should_transpile) = match MediaType::from(&path) {
                MediaType::JavaScript | MediaType::Mjs | MediaType::Cjs => {
                    (ModuleType::JavaScript, false)
                }
                MediaType::Jsx => (ModuleType::JavaScript, true),
                MediaType::TypeScript
                | MediaType::Mts
                | MediaType::Cts
                | MediaType::Dts
                | MediaType::Dmts
                | MediaType::Dcts
                | MediaType::Tsx => (ModuleType::JavaScript, true),
                MediaType::Json => (ModuleType::Json, false),
                _ => panic!("Unknown extension {:?}", path.extension()),
            };

            // Read the file, transpile if necessary.
            let code = std::fs::read_to_string(&path)?;
            let code = if should_transpile {
                let parsed = deno_ast::parse_module(ParseParams {
                    specifier: module_specifier.to_string(),
                    text_info: SourceTextInfo::from_string(code),
                    media_type,
                    capture_tokens: false,
                    scope_analysis: false,
                    maybe_syntax: None,
                })?;
                parsed.transpile(&Default::default())?.text
            } else {
                code
            };

            // Load and return module.
            let module = ModuleSource {
                code: code.into_bytes().into_boxed_slice(),
                module_type,
                module_url_specified: module_specifier.to_string(),
                module_url_found: module_specifier.to_string(),
            };
            Ok(module)
        }
        .boxed_local()
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_request, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
