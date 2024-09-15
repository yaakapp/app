use crate::events::{EmptyPayload, InternalEvent, InternalEventPayload, PluginBootResponse};
use crate::server::plugin_runtime::EventStreamEvent;
use crate::util::gen_id;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

#[derive(Clone)]
pub struct PluginHandle {
    pub ref_id: String,
    pub dir: String,
    pub(crate) to_plugin_tx: Arc<Mutex<mpsc::Sender<tonic::Result<EventStreamEvent>>>>,
    pub(crate) boot_resp: Arc<Mutex<Option<PluginBootResponse>>>,
}

impl PluginHandle {
    pub async fn name(&self) -> String {
        match &*self.boot_resp.lock().await {
            None => "__NOT_BOOTED__".to_string(),
            Some(r) => r.name.to_owned(),
        }
    }

    pub async fn info(&self) -> Option<PluginBootResponse> {
        let resp = &*self.boot_resp.lock().await;
        resp.clone()
    }

    pub fn build_event_to_send(
        &self,
        payload: &InternalEventPayload,
        reply_id: Option<String>,
    ) -> InternalEvent {
        InternalEvent {
            id: gen_id(),
            plugin_ref_id: self.ref_id.clone(),
            reply_id,
            payload: payload.clone(),
        }
    }

    pub async fn reload(&self) -> crate::error::Result<()> {
        let event = self.build_event_to_send(&InternalEventPayload::ReloadRequest(EmptyPayload {}), None);
        self.send(&event).await
    }

    pub async fn send(&self, event: &InternalEvent) -> crate::error::Result<()> {
        // info!(
        //     "Sending event to plugin {} {:?}",
        //     event.id,
        //     self.name().await
        // );
        self.to_plugin_tx
            .lock()
            .await
            .send(Ok(EventStreamEvent {
                event: serde_json::to_string(&event)?,
            }))
            .await?;
        Ok(())
    }

    pub async fn boot(&self, resp: &PluginBootResponse) {
        let mut boot_resp = self.boot_resp.lock().await;
        *boot_resp = Some(resp.clone());
    }
}
