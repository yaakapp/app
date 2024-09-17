use crate::error::Result;
use crate::events::{
    BootResponse, CallHttpRequestActionRequest, CallTemplateFunctionArgs,
    CallTemplateFunctionRequest, CallTemplateFunctionResponse, FilterRequest, FilterResponse,
    GetHttpRequestActionsRequest, GetHttpRequestActionsResponse, GetTemplateFunctionsResponse,
    ImportRequest, ImportResponse, InternalEvent, InternalEventPayload, RenderPurpose,
};
use std::collections::HashMap;

use crate::error::Error::PluginErr;
use crate::nodejs::start_nodejs_plugin_runtime;
use crate::plugin::start_server;
use crate::server::PluginRuntimeGrpcServer;
use std::time::Duration;
use tauri::{AppHandle, Runtime};
use tokio::sync::mpsc;
use tokio::sync::watch::Sender;
use crate::handle::PluginHandle;

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

    pub async fn reload_all(&self) {
        self.server.reload_plugins().await
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

    pub async fn get_plugin_info(&self, dir: &str) -> Option<BootResponse> {
        self.server.plugin_by_dir(dir).await.ok()?.info().await
    }

    pub async fn get_plugin(&self, ref_id: &str) -> Result<PluginHandle> {
        self.server.plugin_by_ref_id(ref_id).await
    }

    pub async fn get_http_request_actions(&self) -> Result<Vec<GetHttpRequestActionsResponse>> {
        let reply_events = self
            .server
            .send_and_wait(&InternalEventPayload::GetHttpRequestActionsRequest(
                GetHttpRequestActionsRequest {},
            ))
            .await?;

        let mut all_actions = Vec::new();
        for event in reply_events {
            if let InternalEventPayload::GetHttpRequestActionsResponse(resp) = event.payload {
                all_actions.push(resp.clone());
            }
        }

        Ok(all_actions)
    }

    pub async fn get_template_functions(&self) -> Result<Vec<GetTemplateFunctionsResponse>> {
        let reply_events = self
            .server
            .send_and_wait(&InternalEventPayload::GetTemplateFunctionsRequest)
            .await?;

        let mut all_actions = Vec::new();
        for event in reply_events {
            if let InternalEventPayload::GetTemplateFunctionsResponse(resp) = event.payload {
                all_actions.push(resp.clone());
            }
        }

        Ok(all_actions)
    }

    pub async fn call_http_request_action(&self, req: CallHttpRequestActionRequest) -> Result<()> {
        let plugin = self
            .server
            .plugin_by_ref_id(req.plugin_ref_id.as_str())
            .await?;
        let event = plugin.build_event_to_send(
            &InternalEventPayload::CallHttpRequestActionRequest(req),
            None,
        );
        plugin.send(&event).await?;
        Ok(())
    }

    pub async fn call_template_function(
        &self,
        fn_name: &str,
        args: HashMap<String, String>,
        purpose: RenderPurpose,
    ) -> Result<Option<String>> {
        let req = CallTemplateFunctionRequest {
            name: fn_name.to_string(),
            args: CallTemplateFunctionArgs {
                purpose,
                values: args,
            },
        };

        let events = self
            .server
            .send_and_wait(&InternalEventPayload::CallTemplateFunctionRequest(req))
            .await?;

        let value = events.into_iter().find_map(|e| match e.payload {
            InternalEventPayload::CallTemplateFunctionResponse(CallTemplateFunctionResponse {
                value,
            }) => value,
            _ => None,
        });

        Ok(value)
    }

    pub async fn import_data(&self, content: &str) -> Result<(ImportResponse, String)> {
        let reply_events = self
            .server
            .send_and_wait(&InternalEventPayload::ImportRequest(ImportRequest {
                content: content.to_string(),
            }))
            .await?;

        // TODO: Don't just return the first valid response
        let result = reply_events.into_iter().find_map(|e| match e.payload {
            InternalEventPayload::ImportResponse(resp) => Some((resp, e.plugin_ref_id)),
            _ => None,
        });

        match result {
            None => Err(PluginErr(
                "No importers found for file contents".to_string(),
            )),
            Some((resp, ref_id)) => {
                let plugin = self.server.plugin_by_ref_id(ref_id.as_str()).await?;
                let plugin_name = plugin.name().await;
                Ok((resp, plugin_name))
            }
        }
    }

    pub async fn filter_data(
        &self,
        filter: &str,
        content: &str,
        content_type: &str,
    ) -> Result<FilterResponse> {
        let plugin_name = if content_type.to_lowercase().contains("json") {
            "filter-jsonpath"
        } else {
            "filter-xpath"
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
            InternalEventPayload::EmptyResponse => {
                Err(PluginErr("Filter returned empty".to_string()))
            }
            e => Err(PluginErr(format!("Export returned invalid event {:?}", e))),
        }
    }
}
