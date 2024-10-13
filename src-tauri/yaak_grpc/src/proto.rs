use anyhow::anyhow;
use hyper_rustls::{HttpsConnector, HttpsConnectorBuilder};
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client;
use hyper_util::rt::TokioExecutor;
use log::{debug, warn};
use prost::Message;
use prost_reflect::{DescriptorPool, MethodDescriptor};
use prost_types::{FileDescriptorProto, FileDescriptorSet};
use std::env::temp_dir;
use std::ops::Deref;
use std::path::PathBuf;
use std::str::FromStr;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;
use tokio::fs;
use tokio_stream::StreamExt;
use tonic::body::BoxBody;
use tonic::codegen::http::uri::PathAndQuery;
use tonic::transport::Uri;
use tonic::Request;
use tonic_reflection::pb::v1::server_reflection_client::ServerReflectionClient;
use tonic_reflection::pb::v1::server_reflection_request::MessageRequest;
use tonic_reflection::pb::v1::server_reflection_response::MessageResponse;
use tonic_reflection::pb::v1::ServerReflectionRequest;

pub async fn fill_pool_from_files(
    app_handle: &AppHandle,
    paths: &Vec<PathBuf>,
) -> Result<DescriptorPool, String> {
    let mut pool = DescriptorPool::new();
    let random_file_name = format!("{}.desc", uuid::Uuid::new_v4());
    let desc_path = temp_dir().join(random_file_name);
    let global_import_dir = app_handle
        .path()
        .resolve("vendored/protoc/protoc-include", BaseDirectory::Resource)
        .expect("failed to resolve protoc include directory");

    // HACK: Remove UNC prefix for Windows paths
    let global_import_dir =
        dunce::simplified(global_import_dir.as_path()).to_string_lossy().to_string();
    let desc_path = dunce::simplified(desc_path.as_path());

    let mut args = vec![
        "--include_imports".to_string(),
        "--include_source_info".to_string(),
        "-I".to_string(),
        global_import_dir,
        "-o".to_string(),
        desc_path.to_string_lossy().to_string(),
    ];

    for p in paths {
        if p.as_path().exists() {
            args.push(p.to_string_lossy().to_string());
        } else {
            continue;
        }

        let parent = p.as_path().parent();
        if let Some(parent_path) = parent {
            args.push("-I".to_string());
            args.push(parent_path.to_string_lossy().to_string());
            args.push("-I".to_string());
            args.push(parent_path.parent().unwrap().to_string_lossy().to_string());
        } else {
            debug!("ignoring {:?} since it does not exist.", parent)
        }
    }

    let out = app_handle
        .shell()
        .sidecar("yaakprotoc")
        .expect("yaakprotoc not found")
        .args(args)
        .output()
        .await
        .expect("yaakprotoc failed to run");

    if !out.status.success() {
        return Err(format!(
            "protoc failed with status {}: {}",
            out.status.code().unwrap(),
            String::from_utf8_lossy(out.stderr.as_slice())
        ));
    }

    let bytes = fs::read(desc_path).await.map_err(|e| e.to_string())?;
    let fdp = FileDescriptorSet::decode(bytes.deref()).map_err(|e| e.to_string())?;
    pool.add_file_descriptor_set(fdp).map_err(|e| e.to_string())?;

    fs::remove_file(desc_path).await.map_err(|e| e.to_string())?;

    Ok(pool)
}

pub async fn fill_pool_from_reflection(uri: &Uri) -> Result<DescriptorPool, String> {
    let mut pool = DescriptorPool::new();
    let mut client = ServerReflectionClient::with_origin(get_transport(), uri.clone());

    for service in list_services(&mut client).await? {
        if service == "grpc.reflection.v1alpha.ServerReflection" {
            continue;
        }
        file_descriptor_set_from_service_name(&service, &mut pool, &mut client).await;
    }

    Ok(pool)
}

pub fn get_transport() -> Client<HttpsConnector<HttpConnector>, BoxBody> {
    if let Err(_) = rustls::crypto::ring::default_provider().install_default() {
        warn!("Default certs already installed");
    }

    let connector = HttpsConnectorBuilder::new()
        .with_native_roots()
        .unwrap()
        .https_or_http()
        .enable_http2()
        .wrap_connector({
            let mut http_connector = HttpConnector::new();
            http_connector.enforce_http(false);
            http_connector

            // TODO: Figure out how to make proxy work. We'll need to run the following on every request:
            //    if let Some(headers) = proxy.http_headers(&uri) {
            //      req.headers_mut().extend(headers.clone().into_iter());
            //    }
            //  This means we need to move this connection logic next to where the req is built

            // let proxy_uri = "http://localhost:9090".parse().unwrap();
            // let proxy = Proxy::new(Intercept::All, proxy_uri);
            // let mut proxy_connector = ProxyConnector::unsecured(http_connector);
            // proxy_connector.add_proxy(proxy);
            // proxy_connector
        });

    Client::builder(TokioExecutor::new()).http2_only(true).build(connector)
}

async fn list_services(
    reflect_client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
) -> Result<Vec<String>, String> {
    let response =
        send_reflection_request(reflect_client, MessageRequest::ListServices("".into())).await?;

    let list_services_response = match response {
        MessageResponse::ListServicesResponse(resp) => resp,
        _ => panic!("Expected a ListServicesResponse variant"),
    };

    Ok(list_services_response.service.iter().map(|s| s.name.clone()).collect::<Vec<_>>())
}

async fn file_descriptor_set_from_service_name(
    service_name: &str,
    pool: &mut DescriptorPool,
    client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
) {
    let response = match send_reflection_request(
        client,
        MessageRequest::FileContainingSymbol(service_name.into()),
    )
    .await
    {
        Ok(resp) => resp,
        Err(e) => {
            warn!("Error fetching file descriptor for service {}: {}", service_name, e);
            return;
        }
    };

    let file_descriptor_response = match response {
        MessageResponse::FileDescriptorResponse(resp) => resp,
        _ => panic!("Expected a FileDescriptorResponse variant"),
    };

    for fd in file_descriptor_response.file_descriptor_proto {
        let fdp = FileDescriptorProto::decode(fd.deref()).unwrap();

        // Add deps first or else we'll get an error
        for dep_name in fdp.clone().dependency {
            file_descriptor_set_by_filename(&dep_name, pool, client).await;
        }

        pool.add_file_descriptor_proto(fdp).expect("add file descriptor proto");
    }
}

async fn file_descriptor_set_by_filename(
    filename: &str,
    pool: &mut DescriptorPool,
    client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
) {
    // We already fetched this file
    if let Some(_) = pool.get_file_by_name(filename) {
        return;
    }

    let response =
        send_reflection_request(client, MessageRequest::FileByFilename(filename.into())).await;
    let file_descriptor_response = match response {
        Ok(MessageResponse::FileDescriptorResponse(resp)) => resp,
        Ok(_) => {
            panic!("Expected a FileDescriptorResponse variant")
        }
        Err(e) => {
            warn!("Error fetching file descriptor for {}: {}", filename, e);
            return;
        }
    };

    for fd in file_descriptor_response.file_descriptor_proto {
        let fdp = FileDescriptorProto::decode(fd.deref()).unwrap();
        pool.add_file_descriptor_proto(fdp).expect("add file descriptor proto");
    }
}

async fn send_reflection_request(
    client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
    message: MessageRequest,
) -> Result<MessageResponse, String> {
    let reflection_request = ServerReflectionRequest {
        host: "".into(), // Doesn't matter
        message_request: Some(message),
    };

    let request = Request::new(tokio_stream::once(reflection_request));

    client
        .server_reflection_info(request)
        .await
        .map_err(|e| match e.code() {
            tonic::Code::Unavailable => "Failed to connect to endpoint".to_string(),
            tonic::Code::Unauthenticated => "Authentication failed".to_string(),
            tonic::Code::DeadlineExceeded => "Deadline exceeded".to_string(),
            _ => e.to_string(),
        })?
        .into_inner()
        .next()
        .await
        .expect("steamed response")
        .map_err(|e| e.to_string())?
        .message_response
        .ok_or("No reflection response".to_string())
}

pub fn method_desc_to_path(md: &MethodDescriptor) -> PathAndQuery {
    let full_name = md.full_name();
    let (namespace, method_name) = full_name
        .rsplit_once('.')
        .ok_or_else(|| anyhow!("invalid method path"))
        .expect("invalid method path");
    PathAndQuery::from_str(&format!("/{}/{}", namespace, method_name)).expect("invalid method path")
}
