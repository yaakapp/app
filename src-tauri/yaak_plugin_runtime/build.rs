fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Tell ts-rs where to generate types to
    println!("cargo:rustc-env=TS_RS_EXPORT_DIR=../../plugin-runtime-types/src/gen");

    // Compile protobuf types
    tonic_build::compile_protos("../../proto/plugins/runtime.proto")?;

    Ok(())
}
