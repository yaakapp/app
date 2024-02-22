import { invoke } from '@tauri-apps/api';

export function trackEvent(
  resource:
    | 'App'
    | 'Dialog'
    | 'CookieJar'
    | 'Sidebar'
    | 'Workspace'
    | 'Environment'
    | 'Folder'
    | 'GrpcEvent'
    | 'GrpcConnection'
    | 'GrpcRequest'
    | 'HttpRequest'
    | 'HttpResponse'
    | 'KeyValue',
  action:
    | 'Toggle'
    | 'Show'
    | 'Hide'
    | 'Launch'
    | 'Create'
    | 'Update'
    | 'Delete'
    | 'DeleteMany'
    | 'Send'
    | 'Duplicate',
  attributes: Record<string, string | number> = {},
) {
  invoke('cmd_track_event', {
    resource: resource,
    action,
    attributes,
  }).catch(console.error);
}
