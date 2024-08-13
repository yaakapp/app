use crate::error::Result;
use crate::events::{
    ExportHttpRequestRequest, ExportHttpRequestResponse, FilterRequest, FilterResponse
    , ImportRequest, ImportResponse, InternalEvent, InternalEventPayload,
};

use crate::error::Error::PluginErr;
use crate::nodejs::start_nodejs_plugin_runtime;
use crate::plugin::start_server;
use crate::server::PluginRuntimeGrpcServer;
use std::time::Duration;
use tauri::{AppHandle, Runtime};
use tokio::sync::mpsc;
use tokio::sync::watch::Sender;
use yaak_models::models::HttpRequest;

pub struct PluginManager {
    kill_tx: Sender<bool>,
    server: PluginRuntimeGrpcServer,
}

impl PluginManager {
    pub async fn new<R: Runtime>(
        app_handle: &AppHandle<R>,
        plugin_dirs: Vec<String>,
    ) -> PluginManager {
        let (server, addr) = start_server(plugin_dirs)
            .await
            .expect("Failed to start plugin runtime server");

        let (kill_tx, kill_rx) = tokio::sync::watch::channel(false);
        start_nodejs_plugin_runtime(app_handle, addr, &kill_rx)
            .await
            .expect("Failed to start plugin runtime");

        PluginManager { kill_tx, server }
    }

    pub async fn subscribe(&self) -> (String, mpsc::Receiver<InternalEvent>) {
        self.server.subscribe().await
    }

    pub async fn unsubscribe(&self, rx_id: &str) {
        self.server.unsubscribe(rx_id).await
    }

    pub async fn cleanup(&self) {
        self.kill_tx.send_replace(true);

        // Give it a bit of time to kill
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    pub async fn reply(
        &self,
        source_event: &InternalEvent,
        payload: &InternalEventPayload,
    ) -> Result<()> {
        let reply_id = Some(source_event.clone().id);
        self.server
            .send(&payload, source_event.plugin_ref_id.as_str(), reply_id)
            .await
    }

    pub async fn run_import(&self, content: &str) -> Result<(ImportResponse, String)> {
        let reply_events = self
            .server
            .send_and_wait(&InternalEventPayload::ImportRequest(ImportRequest {
                content: content.to_string(),
            }))
            .await?;

        // TODO: Don't just return the first valid response
        for event in reply_events {
            match event.payload {
                InternalEventPayload::ImportResponse(resp) => {
                    let ref_id = event.plugin_ref_id.as_str();
                    let plugin = self.server.plugin_by_ref_id(ref_id).await?;
                    let plugin_name = plugin.name().await;
                    return Ok((resp, plugin_name));
                }
                _ => {}
            }
        }

        Err(PluginErr("No import responses found".to_string()))
    }

    pub async fn run_export_curl(
        &self,
        request: &HttpRequest,
    ) -> Result<ExportHttpRequestResponse> {
        let event = self
            .server
            .send_to_plugin_and_wait(
                "exporter-curl",
                &InternalEventPayload::ExportHttpRequestRequest(ExportHttpRequestRequest {
                    http_request: request.to_owned(),
                }),
            )
            .await?;

        match event.payload {
            InternalEventPayload::ExportHttpRequestResponse(resp) => Ok(resp),
            InternalEventPayload::EmptyResponse(_) => {
                Err(PluginErr("Export returned empty".to_string()))
            }
            e => Err(PluginErr(format!("Export returned invalid event {:?}", e))),
        }
    }

    pub async fn run_filter(
        &self,
        filter: &str,
        content: &str,
        content_type: &str,
    ) -> Result<FilterResponse> {
        let plugin_name = match content_type {
            "application/json" => "filter-jsonpath",
            _ => "filter-xpath",
        };

        let event = self
            .server
            .send_to_plugin_and_wait(
                plugin_name,
                &InternalEventPayload::FilterRequest(FilterRequest {
                    filter: filter.to_string(),
                    content: content.to_string(),
                }),
            )
            .await?;

        match event.payload {
            InternalEventPayload::FilterResponse(resp) => Ok(resp),
            InternalEventPayload::EmptyResponse(_) => {
                Err(PluginErr("Filter returned empty".to_string()))
            }
            e => Err(PluginErr(format!("Export returned invalid event {:?}", e))),
        }
    }
}
