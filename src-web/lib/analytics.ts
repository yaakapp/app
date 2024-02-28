import { invoke } from '@tauri-apps/api';

export function trackEvent(
  resource:
    | 'app'
    | 'cookie_jar'
    | 'dialog'
    | 'environment'
    | 'folder'
    | 'grpc_connection'
    | 'grpc_event'
    | 'grpc_request'
    | 'http_request'
    | 'http_response'
    | 'key_value'
    | 'setting'
    | 'sidebar'
    | 'workspace',
  action:
    | 'cancel'
    | 'commit'
    | 'create'
    | 'delete'
    | 'delete_many'
    | 'duplicate'
    | 'hide'
    | 'launch'
    | 'send'
    | 'show'
    | 'toggle'
    | 'update',

  attributes: Record<string, string | number> = {},
) {
  invoke('cmd_track_event', {
    resource: resource,
    action,
    attributes,
  }).catch(console.error);
}
