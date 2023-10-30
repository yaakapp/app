use boa_engine::{
    js_string,
    module::{ModuleLoader, SimpleModuleLoader},
    property::Attribute,
    Context, JsArgs, JsNativeError, JsValue, Module, NativeFunction, Source,
};
use boa_runtime::Console;
use tauri::AppHandle;

pub fn test_plugins(app_handle: &AppHandle) {
    let plugin_dir = app_handle
        .path_resolver()
        .resolve_resource("plugins/hello-world")
        .expect("failed to resolve plugin directory resource");
    let plugin_entry_file = app_handle
        .path_resolver()
        .resolve_resource("plugins/hello-world/index.js")
        .expect("failed to resolve plugin entry point resource");

    // Module loader for the specific plugin
    let loader = &SimpleModuleLoader::new(plugin_dir).expect("failed to create module loader");
    let dyn_loader: &dyn ModuleLoader = loader;

    let context = &mut Context::builder()
        .module_loader(dyn_loader)
        .build()
        .expect("failed to create context");

    add_runtime(context);
    add_globals(context);

    let source = Source::from_filepath(&plugin_entry_file).expect("Error opening file");

    // Can also pass a `Some(realm)` if you need to execute the module in another realm.
    let module = Module::parse(source, None, context).expect("failed to parse module");

    // Insert parsed entrypoint into the module loader
    // TODO: Is this needed if loaded from file already?
    loader.insert(plugin_entry_file, module.clone());

    let _promise_result = module
        .load_link_evaluate(context)
        .expect("failed to evaluate module");

    // Very important to push forward the job queue after queueing promises.
    context.run_jobs();

    // // Checking if the final promise didn't return an error.
    // match promise_result.state() {
    //     PromiseState::Pending => return Err("module didn't execute!".into()),
    //     PromiseState::Fulfilled(v) => {
    //         assert_eq!(v, JsValue::undefined())
    //     }
    //     PromiseState::Rejected(err) => {
    //         return Err(JsError::from_opaque(err).try_native(context)?.into())
    //     }
    // }

    let namespace = module.namespace(context);

    let entrypoint_fn = namespace
        .get(js_string!("entrypoint"), context)
        .expect("failed to get entrypoint")
        .as_callable()
        .cloned()
        .ok_or_else(|| JsNativeError::typ().with_message("export wasn't a function!"))
        .expect("Failed to get entrypoint");

    // Actually call the entrypoint function
    let _result = entrypoint_fn
        .call(&JsValue::undefined(), &[], context)
        .expect("Failed to call entrypoint");
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
