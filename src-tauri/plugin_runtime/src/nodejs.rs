use std::fs::File;
use std::io::Write;

pub async fn ensure_nodejs() -> Result<(), String> {
    let version = "v22.3.0";
    let os = get_os();
    let arch = get_arch();
    let ext = get_ext();
    let url = format!("https://nodejs.org/download/release/{version}/node-{version}-{os}-{arch}.{ext}");
    println!("FETCHING URL {url}");

    let bts = reqwest::get(url).await.unwrap().bytes().await.unwrap();
    let mut file = File::create(format!("node-{version}-{os}-{arch}.{ext}")).unwrap();
    file.write_all(bts.iter().as_slice()).unwrap();

    Ok(())
}

fn get_os() -> &'static str {
    if cfg!(target_os = "windows") {
        "win"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    }
}

fn get_ext() -> &'static str {
    if cfg!(target_os = "windows") {
        "zip"
    } else {
        "tar.gz"
    }
}

fn get_arch() -> &'static str {
    if cfg!(target_arch = "x86_64") {
        "x64"
    } else if cfg!(target_arch = "x86") {
        "x64" // Not sure if possible
    } else {
        "arm64" // Not sure if possible
    }
}
