use std::fs;

use boa_engine::builtins::promise::PromiseState;
use boa_engine::{
    js_string,
    module::{ModuleLoader, SimpleModuleLoader},
    property::Attribute,
    Context, JsArgs, JsNativeError, JsValue, Module, NativeFunction, Source,
};
use boa_runtime::Console;
use log::debug;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::AppHandle;

use crate::models::{Environment, Folder, HttpRequest, Workspace};

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct ImportResult {
    pub resources: ImportResources,
}

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct ImportResources {
    pub workspaces: Vec<Workspace>,
    pub environments: Vec<Environment>,
    pub folders: Vec<Folder>,
    pub requests: Vec<HttpRequest>,
}

pub async fn run_plugin_import(
    app_handle: &AppHandle,
    plugin_name: &str,
    file_path: &str,
) -> Option<ImportResult> {
    let file = fs::read_to_string(file_path)
        .unwrap_or_else(|_| panic!("Unable to read file {}", file_path));
    let file_contents = file.as_str();
    let result_json = run_plugin(
        app_handle,
        plugin_name,
        "pluginHookImport",
        &[js_string!(file_contents).into()],
    );

    if result_json.is_null() {
        return None;
    }

    let resources: ImportResult =
        serde_json::from_value(result_json).expect("failed to parse result json");
    Some(resources)
}

fn run_plugin(
    app_handle: &AppHandle,
    plugin_name: &str,
    entrypoint: &str,
    js_args: &[JsValue],
) -> serde_json::Value {
    let plugin_dir = app_handle
        .path_resolver()
        .resolve_resource("plugins")
        .expect("failed to resolve plugin directory resource")
        .join(plugin_name);
    let plugin_index_file = plugin_dir.join("index.mjs");

    debug!(
        "Running plugin dir={:?} file={:?}",
        plugin_dir, plugin_index_file
    );

    // Module loader for the specific plugin
    let loader = &SimpleModuleLoader::new(plugin_dir).expect("failed to create module loader");
    let dyn_loader: &dyn ModuleLoader = loader;

    let context = &mut Context::builder()
        .module_loader(dyn_loader)
        .build()
        .expect("failed to create context");

    add_runtime(context);
    add_globals(context);

    let source = Source::from_filepath(&plugin_index_file).expect("Error opening file");

    // Can also pass a `Some(realm)` if you need to execute the module in another realm.
    let module = Module::parse(source, None, context).expect("failed to parse module");

    // Insert parsed entrypoint into the module loader
    // TODO: Is this needed if loaded from file already?
    loader.insert(plugin_index_file, module.clone());

    let promise_result = module
        .load_link_evaluate(context)
        .expect("failed to evaluate module");

    // Very important to push forward the job queue after queueing promises.
    context.run_jobs();

    // Checking if the final promise didn't return an error.
    match promise_result.state().expect("failed to get promise state") {
        PromiseState::Pending => {
            panic!("Promise was pending");
        }
        PromiseState::Fulfilled(v) => {
            assert_eq!(v, JsValue::undefined())
        }
        PromiseState::Rejected(err) => {
            panic!("Failed to link: {}", err.display());
        }
    }

    let namespace = module.namespace(context);

    let result = namespace
        .get(js_string!(entrypoint), context)
        .expect("failed to get entrypoint")
        .as_callable()
        .cloned()
        .ok_or_else(|| JsNativeError::typ().with_message("export wasn't a function!"))
        .expect("Failed to get entrypoint")
        .call(&JsValue::undefined(), js_args, context)
        .expect("Failed to call entrypoint");

    match result.is_undefined() {
        true => json!(null), // to_json doesn't work with undefined (yet)
        false => result
            .to_json(context)
            .expect("failed to convert result to json"),
    }
}

fn add_runtime(context: &mut Context<'_>) {
    let console = Console::init(context);
    context
        .register_global_property(js_string!(Console::NAME), console, Attribute::all())
        .expect("the console builtin shouldn't exist");
}

fn add_globals(context: &mut Context<'_>) {
    context
        .register_global_builtin_callable(
            "sayHello",
            1,
            NativeFunction::from_fn_ptr(|_, args, context| {
                let value: String = args
                    .get_or_undefined(0)
                    .try_js_into(context)
                    .expect("failed to convert arg");
                println!("Hello {}!", value);
                Ok(value.into())
            }),
        )
        .expect("failed to register global");
}
