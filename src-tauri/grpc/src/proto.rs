use std::ops::Deref;
use std::str::FromStr;

use anyhow::anyhow;
use hyper::client::HttpConnector;
use hyper::Client;
use hyper_rustls::{HttpsConnector, HttpsConnectorBuilder};
use prost::Message;
use prost_reflect::{DescriptorPool, MethodDescriptor};
use prost_types::FileDescriptorProto;
use tokio_stream::StreamExt;
use tonic::body::BoxBody;
use tonic::codegen::http::uri::PathAndQuery;
use tonic::transport::Uri;
use tonic::Request;
use tonic_reflection::pb::server_reflection_client::ServerReflectionClient;
use tonic_reflection::pb::server_reflection_request::MessageRequest;
use tonic_reflection::pb::server_reflection_response::MessageResponse;
use tonic_reflection::pb::ServerReflectionRequest;

pub async fn fill_pool(
    uri: &Uri,
) -> (
    DescriptorPool,
    Client<HttpsConnector<HttpConnector>, BoxBody>,
) {
    let mut pool = DescriptorPool::new();
    let connector = HttpsConnectorBuilder::new().with_native_roots();
    let connector = connector.https_or_http().enable_http2().wrap_connector({
        let mut http_connector = HttpConnector::new();
        http_connector.enforce_http(false);
        http_connector
    });
    let transport = Client::builder()
        .pool_max_idle_per_host(0)
        .http2_only(true)
        .build(connector);

    println!(
        "URI uri={} host={:?} authority={:?}",
        uri,
        uri.host(),
        uri.authority()
    );
    let mut client = ServerReflectionClient::with_origin(transport.clone(), uri.clone());
    let services = list_services(&mut client).await;

    for service in services {
        if service == "grpc.reflection.v1alpha.ServerReflection" {
            continue;
        }
        file_descriptor_set_from_service_name(&service, &mut pool, &mut client).await;
    }

    (pool, transport)
}

async fn list_services(
    reflect_client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
) -> Vec<String> {
    let response =
        send_reflection_request(reflect_client, MessageRequest::ListServices("".into())).await;

    let list_services_response = match response {
        MessageResponse::ListServicesResponse(resp) => resp,
        _ => panic!("Expected a ListServicesResponse variant"),
    };

    list_services_response
        .service
        .iter()
        .map(|s| s.name.clone())
        .collect::<Vec<_>>()
}

async fn file_descriptor_set_from_service_name(
    service_name: &str,
    pool: &mut DescriptorPool,
    client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
) {
    let response = send_reflection_request(
        client,
        MessageRequest::FileContainingSymbol(service_name.into()),
    )
    .await;

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

        pool.add_file_descriptor_proto(fdp)
            .expect("add file descriptor proto");
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
        MessageResponse::FileDescriptorResponse(resp) => resp,
        _ => panic!("Expected a FileDescriptorResponse variant"),
    };

    for fd in file_descriptor_response.file_descriptor_proto {
        let fdp = FileDescriptorProto::decode(fd.deref()).unwrap();
        pool.add_file_descriptor_proto(fdp)
            .expect("add file descriptor proto");
    }
}

async fn send_reflection_request(
    client: &mut ServerReflectionClient<Client<HttpsConnector<HttpConnector>, BoxBody>>,
    message: MessageRequest,
) -> MessageResponse {
    let reflection_request = ServerReflectionRequest {
        host: "".into(), // Doesn't matter
        message_request: Some(message),
    };

    let request = Request::new(tokio_stream::once(reflection_request));

    client
        .server_reflection_info(request)
        .await
        .expect("server reflection failed")
        .into_inner()
        .next()
        .await
        .expect("steamed response")
        .expect("successful response")
        .message_response
        .expect("some MessageResponse")
}

pub fn method_desc_to_path(md: &MethodDescriptor) -> PathAndQuery {
    let full_name = md.full_name();
    let (namespace, method_name) = full_name
        .rsplit_once('.')
        .ok_or_else(|| anyhow!("invalid method path"))
        .expect("invalid method path");
    PathAndQuery::from_str(&format!("/{}/{}", namespace, method_name)).expect("invalid method path")
}
