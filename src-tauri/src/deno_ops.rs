use deno_core::error::AnyError;
use deno_core::op2;

#[op2]
#[serde]
pub fn op_yaml_parse(#[string] text: String) -> Result<serde_json::Value, AnyError> {
    let value = serde_yaml::from_str(&text)?;
    Ok(value)
}

#[op2]
#[string]
pub fn op_yaml_stringify(#[serde] value: serde_json::Value) -> Result<String, AnyError> {
    let value = serde_yaml::to_string(&value)?;
    Ok(value)
}
