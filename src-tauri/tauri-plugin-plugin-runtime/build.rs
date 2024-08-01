fn main() -> Result<(), Box<dyn std::error::Error>> {
    let derive = "#[derive(serde::Deserialize, serde::Serialize)]\n#[serde(default, rename_all = \"camelCase\")]";
    tonic_build::configure()
        .type_attribute("HttpRequestAction", derive)
        .type_attribute("GetHttpRequestActionsResponse", derive)
        .type_attribute("Callback", derive)
        .compile(&["../../proto/yaak/plugin_runtime.proto"], &["../../proto"])?;
    Ok(())
}
