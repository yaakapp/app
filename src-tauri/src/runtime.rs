use std::cell::RefCell;
use std::collections::HashMap;
use std::pin::Pin;
use std::rc::Rc;

use deno_ast::{MediaType, ParseParams, SourceTextInfo};
use deno_core::anyhow::{anyhow, bail, Error};
use deno_core::error::AnyError;
use deno_core::futures::FutureExt;
use deno_core::{
    resolve_import, Extension, JsRuntime, ModuleLoader, ModuleSource, ModuleSourceFuture,
    ModuleSpecifier, ModuleType, ResolutionKind, RuntimeOptions, SourceMapGetter,
};
use futures::executor;

pub fn run_plugin_sync(file_path: &str) -> Result<(), AnyError> {
    executor::block_on(run_plugin(file_path))
}

pub async fn run_plugin(file_path: &str) -> Result<(), AnyError> {
    let extension = Extension {
        name: "runtime",
        // ops: std::borrow::Cow::Borrowed(&[op_hello::DECL]),
        ..Default::default()
    };
    let source_map_store = SourceMapStore(Rc::new(RefCell::new(HashMap::new())));

    // Initialize a runtime instance
    let mut runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(TypescriptModuleLoader {
            source_maps: source_map_store.clone(),
        })),
        extensions: vec![extension],
        ..Default::default()
    });

    runtime
        .execute_script_static("<runtime>", include_str!("runtime.js"))
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

#[derive(Clone)]
struct SourceMapStore(Rc<RefCell<HashMap<String, Vec<u8>>>>);

impl SourceMapGetter for SourceMapStore {
    fn get_source_map(&self, specifier: &str) -> Option<Vec<u8>> {
        self.0.borrow().get(specifier).cloned()
    }

    fn get_source_line(&self, _file_name: &str, _line_number: usize) -> Option<String> {
        None
    }
}

struct TypescriptModuleLoader {
    source_maps: SourceMapStore,
}

impl ModuleLoader for TypescriptModuleLoader {
    fn resolve(
        &self,
        specifier: &str,
        referrer: &str,
        _kind: ResolutionKind,
    ) -> Result<ModuleSpecifier, Error> {
        Ok(resolve_import(specifier, referrer)?)
    }

    fn load(
        &self,
        module_specifier: &ModuleSpecifier,
        _maybe_referrer: Option<&ModuleSpecifier>,
        _is_dyn_import: bool,
    ) -> Pin<Box<ModuleSourceFuture>> {
        let source_maps = self.source_maps.clone();
        fn load(
            source_maps: SourceMapStore,
            module_specifier: &ModuleSpecifier,
        ) -> Result<ModuleSource, AnyError> {
            let path = module_specifier
                .to_file_path()
                .map_err(|_| anyhow!("Only file:// URLs are supported."))?;

            let media_type = MediaType::from_path(&path);
            let (module_type, should_transpile) = match MediaType::from_path(&path) {
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
                _ => bail!("Unknown extension {:?}", path.extension()),
            };

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
                let res = parsed.transpile(&deno_ast::EmitOptions {
                    inline_source_map: false,
                    source_map: true,
                    inline_sources: true,
                    ..Default::default()
                })?;
                let source_map = res.source_map.unwrap();
                source_maps
                    .0
                    .borrow_mut()
                    .insert(module_specifier.to_string(), source_map.into_bytes());
                res.text
            } else {
                code
            };
            Ok(ModuleSource::new(
                module_type,
                code.into(),
                module_specifier,
            ))
        }

        futures::future::ready(load(source_maps, module_specifier)).boxed_local()
    }
}
