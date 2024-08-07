use crate::error::Result;
use crate::events::{
    ExportHttpRequestRequest, ExportHttpRequestResponse, FilterResponse, ImportRequest,
    InternalEvent, InternalEventPayload,
};
use crate::nodejs::start_nodejs_plugin_runtime;
use crate::server::plugin_runtime::HookResponse;
use crate::server::PluginRuntimeGrpcServer;
use multiqueue::BroadcastReceiver;
use std::net::SocketAddr;
use std::time::Duration;
use tauri::{AppHandle, Runtime};
use tokio::sync::watch::Sender;
use yaak_models::models::HttpRequest;

pub struct PluginManager {
    kill_tx: Sender<bool>,
    server: PluginRuntimeGrpcServer,
    pub events_rx: BroadcastReceiver<InternalEvent>,
}

impl PluginManager {
    pub async fn new<R: Runtime>(
        app_handle: &AppHandle<R>,
        server: PluginRuntimeGrpcServer,
        addr: SocketAddr,
        events_rx: BroadcastReceiver<InternalEvent>,
    ) -> PluginManager {
        let (kill_tx, kill_rx) = tokio::sync::watch::channel(false);
        start_nodejs_plugin_runtime(app_handle, addr, &kill_rx)
            .await
            .expect("Failed to start plugin runtime");
        PluginManager {
            kill_tx,
            events_rx,
            server,
        }
    }

    pub async fn cleanup(&mut self) {
        self.kill_tx.send_replace(true);

        // Give it a bit of time to kill
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    pub async fn run_import(&mut self, data: &str) -> Result<HookResponse> {
        self.server
            .send_for_reply(InternalEventPayload::ImportRequest(ImportRequest {
                content: data.to_string(),
            }))
            .await?;

        for event in self.events_rx.add_stream() {
            println!("EVENT {event:?}");
        }

        todo!()

        // let response = self
        //     .client
        //     .hook_import(tonic::Request::new(HookImportRequest {
        //         data: data.to_string(),
        //     }))
        //     .await
        //     .map_err(|e| e.message().to_string())?;
        //
        // Ok(response.into_inner())
    }

    pub async fn run_export_curl(
        &mut self,
        request: &HttpRequest,
    ) -> Result<ExportHttpRequestResponse> {
        println!("EXPORTING TO CURL");
        let events = self
            .server
            .send_for_reply(InternalEventPayload::ExportHttpRequestRequest(
                ExportHttpRequestRequest {
                    http_request: request.to_owned(),
                },
            ))
            .await?;

        let reply_ids = events
            .iter()
            .map(|e| e.reply_id.to_owned().unwrap())
            .collect::<Vec<String>>();
        
        println!("Waiting for reply ids: {reply_ids:?}");
        for event in self.events_rx.add_stream() {
            match event.payload {
                InternalEventPayload::ExportHttpRequestResponse(resp) => {
                    println!("Found export response {resp:?}");
                    return Ok(resp);
                }
                _ => {}
            }
        };
        

        todo!("Implement curl export");
        // let response = self
        //     .client
        //     .hook_export(tonic::Request::new(HookExportRequest {
        //         request: request.to_string(),
        //     }))
        //     .await
        //     .map_err(|e| e.message().to_string())?;
        //
        // Ok(response.into_inner())
    }

    pub async fn run_filter(
        &mut self,
        _filter: &str,
        _body: &str,
        _content_type: &str,
    ) -> Result<FilterResponse> {
        todo!("Implement response filter")
        // let response = self
        //     .client
        //     .hook_response_filter(tonic::Request::new(HookResponseFilterRequest {
        //         filter: filter.to_string(),
        //         body: body.to_string(),
        //         content_type: content_type.to_string(),
        //     }))
        //     .await
        //     .map_err(|e| e.message().to_string())?;
        //
        // let result = response.into_inner();
        // debug!("Ran plugin response filter {}", result.data);
        // Ok(result)
    }
}
