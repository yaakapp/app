// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
//! This example shows how to use swc to transpile TypeScript and JSX/TSX
//! modules.
//!
//! It will only transpile, not typecheck (like Deno's `--no-check` flag).

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;

use anyhow::anyhow;
use anyhow::bail;
use anyhow::Context;
use anyhow::Error;
use deno_ast::ParseParams;
use deno_ast::{EmitOptions, MediaType, SourceMapOption, TranspileOptions};
use deno_core::error::{AnyError, JsError};
use deno_core::resolve_path;
use deno_core::JsRuntime;
use deno_core::ModuleLoadResponse;
use deno_core::ModuleLoader;
use deno_core::ModuleSource;
use deno_core::ModuleSourceCode;
use deno_core::ModuleSpecifier;
use deno_core::ModuleType;
use deno_core::RequestedModuleType;
use deno_core::ResolutionKind;
use deno_core::RuntimeOptions;
use deno_core::SourceMapGetter;
use deno_core::{resolve_import, v8};
use tokio::task::block_in_place;

use crate::deno_ops::op_yaml_parse;
use crate::plugin::PluginCapability;

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
        _requested_module_type: RequestedModuleType,
    ) -> ModuleLoadResponse {
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
                    specifier: module_specifier.clone(),
                    text: Arc::from(code),
                    media_type,
                    capture_tokens: false,
                    scope_analysis: false,
                    maybe_syntax: None,
                })?;
                let res = parsed.transpile(
                    &TranspileOptions::default(),
                    &EmitOptions {
                        source_map: SourceMapOption::Separate,
                        inline_sources: true,
                        ..Default::default()
                    },
                )?;
                let src = res.into_source();
                let source_map = src.source_map.unwrap();
                let source = src.source;
                source_maps
                    .0
                    .borrow_mut()
                    .insert(module_specifier.to_string(), source_map);
                String::from_utf8(source).unwrap()
            } else {
                code
            };

            Ok(ModuleSource::new(
                module_type,
                ModuleSourceCode::String(code.into()),
                module_specifier,
                None,
            ))
        }

        ModuleLoadResponse::Sync(load(source_maps, module_specifier))
    }
}

pub fn run_plugin_block(
    plugin_index_file: &str,
    fn_name: &str,
    fn_args: Vec<serde_json::Value>,
) -> Result<serde_json::Value, Error> {
    block_in_place(|| {
        tauri::async_runtime::block_on(run_plugin(plugin_index_file, fn_name, fn_args))
    })
}

deno_core::extension!(
    yaak_runtime,
    ops = [ op_yaml_parse ],
    esm_entry_point = "ext:yaak_runtime/yaml.js",
    esm = [dir "src/plugin-runtime", "yaml.js"]
);

async fn run_plugin(
    plugin_index_file: &str,
    fn_name: &str,
    fn_args: Vec<serde_json::Value>,
) -> Result<serde_json::Value, Error> {
    let mut js_runtime = load_js_runtime()?;
    let module_namespace = load_main_module(&mut js_runtime, plugin_index_file).await?;
    let scope = &mut js_runtime.handle_scope();
    let module_namespace = v8::Local::<v8::Object>::new(scope, module_namespace);

    // Get the exported function we're calling
    let func_key = v8::String::new(scope, fn_name).unwrap();
    let func = module_namespace.get(scope, func_key.into()).unwrap();
    let func = v8::Local::<v8::Function>::try_from(func).unwrap();
    let tc_scope = &mut v8::TryCatch::new(scope);

    // Create Yaak context object
    let null = v8::null(tc_scope).into();
    let name = v8::String::new(tc_scope, "foo").unwrap().into();
    let value = v8::String::new(tc_scope, "bar").unwrap().into();
    let yaak_ctx: v8::Local<v8::Value> =
        v8::Object::with_prototype_and_properties(tc_scope, null, &[name], &[value]).into();

    // Create the function arguments
    let passed_args = &mut fn_args
        .iter()
        .map(|a| {
            let v: v8::Local<v8::Value> = deno_core::serde_v8::to_v8(tc_scope, a).unwrap();
            v
        })
        .collect::<Vec<v8::Local<v8::Value>>>();

    let all_args = &mut vec![yaak_ctx];
    all_args.append(passed_args);

    // Call the function
    let func_res = func.call(tc_scope, module_namespace.into(), all_args);

    // Catch and return any thrown errors
    if tc_scope.has_caught() {
        let e = tc_scope.exception().unwrap();
        let js_error = JsError::from_v8_exception(tc_scope, e);
        return Err(Error::msg(js_error.stack.unwrap_or_default()));
    }

    // Handle the result
    match func_res {
        None => Ok(serde_json::Value::Null),
        Some(res) => {
            if res.is_null() || res.is_undefined() {
                Ok(serde_json::Value::Null)
            } else {
                let value: serde_json::Value = deno_core::serde_v8::from_v8(tc_scope, res).unwrap();
                Ok(value)
            }
        }
    }
}

pub fn get_plugin_capabilities_block(plugin_index_file: &str) -> Result<Vec<PluginCapability>, Error> {
    block_in_place(|| tauri::async_runtime::block_on(get_plugin_capabilities(plugin_index_file)))
}

pub async fn get_plugin_capabilities(
    plugin_index_file: &str,
) -> Result<Vec<PluginCapability>, Error> {
    let mut js_runtime = load_js_runtime()?;
    let module_namespace = load_main_module(&mut js_runtime, plugin_index_file).await?;
    let scope = &mut js_runtime.handle_scope();
    let module_namespace = v8::Local::<v8::Object>::new(scope, module_namespace);

    let property_names =
        match module_namespace.get_own_property_names(scope, v8::GetPropertyNamesArgs::default()) {
            None => return Ok(Vec::new()),
            Some(names) => names,
        };

    let mut capabilities: Vec<PluginCapability> = Vec::new();
    for i in 0..property_names.length() {
        let name = property_names.get_index(scope, i);
        let name = match name {
            Some(name) => name,
            None => return Ok(Vec::new()),
        };

        match name.to_rust_string_lossy(scope).as_str() {
            "pluginHookImport" => _ = capabilities.push(PluginCapability::Import),
            "pluginHookExport" => _ = capabilities.push(PluginCapability::Export),
            "pluginHookResponseFilter" => _ = capabilities.push(PluginCapability::Filter),
            _ => {}
        };
    }

    Ok(capabilities)
}

async fn load_main_module(
    js_runtime: &mut JsRuntime,
    plugin_index_file: &str,
) -> Result<v8::Global<v8::Object>, Error> {
    let main_module = resolve_path(
        plugin_index_file,
        &std::env::current_dir().context("Unable to get CWD")?,
    )?;

    // Load the main module so we can do stuff with it
    let mod_id = js_runtime.load_main_es_module(&main_module).await?;
    let result = js_runtime.mod_evaluate(mod_id);
    js_runtime.run_event_loop(Default::default()).await?;
    result.await?;

    let module_namespace = js_runtime.get_module_namespace(mod_id).unwrap();

    Ok(module_namespace)
}

fn load_js_runtime<'s>() -> Result<JsRuntime, Error> {
    let source_map_store = SourceMapStore(Rc::new(RefCell::new(HashMap::new())));

    let mut ext_console = deno_console::deno_console::init_ops_and_esm();
    ext_console.esm_entry_point = Some("ext:deno_console/01_console.js");

    let ext_yaak = yaak_runtime::init_ops_and_esm();

    let js_runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(TypescriptModuleLoader {
            source_maps: source_map_store.clone(),
        })),
        source_map_getter: Some(Rc::new(source_map_store)),
        extensions: vec![ext_console, ext_yaak],
        ..Default::default()
    });

    // let main_module = resolve_path(
    //     plugin_index_file.to_str().unwrap(),
    //     &std::env::current_dir().context("Unable to get CWD")?,
    // )?;
    //
    // // Load the main module so we can do stuff with it
    // let mod_id = js_runtime.load_main_es_module(&main_module).await?;
    // let result = js_runtime.mod_evaluate(mod_id);
    // js_runtime.run_event_loop(Default::default()).await?;
    // result.await?;
    //
    // let module_namespace = js_runtime.get_module_namespace(mod_id).unwrap();
    // let scope = &mut js_runtime.handle_scope();
    // let module_namespace = v8::Local::<v8::Object>::new(scope, module_namespace);

    Ok(js_runtime)
}
