fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Tell ts-rs where to generate types to
    println!("cargo:rustc-env=TS_RS_EXPORT_DIR=../../src-web/gen");
    
    Ok(())
}
