import { invoke } from '@tauri-apps/api';

export function trackEvent(
  resource:
    | 'App'
    | 'Sidebar'
    | 'Workspace'
    | 'Environment'
    | 'Folder'
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
  invoke('track_event', {
    resource: resource,
    action,
    attributes,
  }).catch(console.error);
}
