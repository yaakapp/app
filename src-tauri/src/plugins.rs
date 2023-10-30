use boa_engine::{
    js_string, property::Attribute, Context, JsArgs, NativeFunction, Source,
};
use boa_runtime::Console;
use tauri::AppHandle;

pub fn test_plugins(app_handle: &AppHandle) {
    let file = app_handle
        .path_resolver()
        .resolve_resource("plugins/hello-world.js")
        .expect("failed to resolve resource");
    let src = Source::from_filepath(&file).expect("Error opening file");

    // Instantiate the execution context
    let mut context = Context::default();
    add_runtime(&mut context);

    // Add globals
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

    context.eval(src).expect("failed to execute script");
}

fn add_runtime(context: &mut Context<'_>) {
    let console = Console::init(context);
    context
        .register_global_property(js_string!(Console::NAME), console, Attribute::all())
        .expect("the console builtin shouldn't exist");
}
