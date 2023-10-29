use boa_engine::{js_string, property::Attribute, Context, Source};
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

    // Parse the source code
    match context.eval(src) {
        Ok(res) => {
            println!(
                "RESULT: {}",
                res.to_string(&mut context).unwrap().to_std_string_escaped()
            );
        }
        Err(e) => {
            // Pretty print the error
            eprintln!("Uncaught {e}");
        }
    };
}

/// Adds the custom runtime to the context.
fn add_runtime(context: &mut Context<'_>) {
    // We first add the `console` object, to be able to call `console.log()`.
    let console = Console::init(context);
    context
        .register_global_property(js_string!(Console::NAME), console, Attribute::all())
        .expect("the console builtin shouldn't exist");
}
