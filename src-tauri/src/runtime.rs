use std::rc::Rc;

use deno_ast::{MediaType, ParseParams, SourceTextInfo};
use deno_core::error::AnyError;
use deno_core::futures::FutureExt;
use deno_core::{op, Extension, JsRuntime, ModuleCode, ModuleSource, ModuleType, RuntimeOptions};
use futures::executor;

pub fn run_plugin_sync(file_path: &str) -> Result<(), AnyError> {
    executor::block_on(run_plugin(file_path))
}

pub async fn run_plugin(file_path: &str) -> Result<(), AnyError> {
    let extension = Extension::builder("runtime")
        .ops(vec![op_hello::decl()])
        .build();

    // Initialize a runtime instance
    let mut runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(TsModuleLoader)),
        extensions: vec![extension],
        ..Default::default()
    });

    runtime
        .execute_script("<runtime>", include_str!("runtime.js"))
        .expect("Failed to execute runtime.js");

    let current_dir = &std::env::current_dir().expect("Unable to get CWD");
    let main_module =
        deno_core::resolve_path(file_path, current_dir).expect("Failed to resolve path");
    let mod_id = runtime
        .load_main_module(&main_module, None)
        .await
        .expect("Failed to load main module");
    let result = runtime.mod_evaluate(mod_id);
    runtime
        .run_event_loop(false)
        .await
        .expect("Failed to run event loop");
    result.await?
}

#[op]
async fn op_hello(name: String) -> Result<String, AnyError> {
    let contents = format!("Hello {} from Rust!", name);
    println!("{}", contents);
    Ok(contents)
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
            let path = module_specifier
                .to_file_path()
                .expect("Failed to convert to file path");

            // Determine what the MediaType is (this is done based on the file
            // extension) and whether transpiling is required.
            let media_type = MediaType::from_path(&path);
            let (module_type, should_transpile) = match media_type {
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
                code: ModuleCode::from(code),
                module_type,
                module_url_specified: module_specifier.to_string(),
                module_url_found: module_specifier.to_string(),
            };
            Ok(module)
        }
        .boxed_local()
    }
}
