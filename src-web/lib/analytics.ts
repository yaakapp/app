import { invokeCmd } from './tauri';

export type TrackResource =
  | 'appearance'
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
  | 'plugin'
  | 'setting'
  | 'sidebar'
  | 'theme'
  | 'workspace';

export type TrackAction =
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
  | 'update';

export function trackEvent(
  resource: TrackResource,
  action: TrackAction,
  attributes: Record<string, string | number> = {},
) {
  invokeCmd('cmd_track_event', {
    resource: resource,
    action,
    attributes,
  }).catch(console.error);
}
