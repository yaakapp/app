fn main() -> Result<(), Box<dyn std::error::Error>> {
    let derive = "#[derive(serde::Deserialize, serde::Serialize)]\n#[serde(default, rename_all = \"camelCase\")]";
    tonic_build::configure()
        .type_attribute("RequestAction", derive)
        .type_attribute("HookHttpRequestActionResponse", derive)
        .type_attribute("Callback", derive)
        .compile(&["../../proto/plugins/runtime.proto"], &["../../proto"])?;
    Ok(())
}
