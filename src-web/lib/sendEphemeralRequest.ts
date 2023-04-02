import { invoke } from '@tauri-apps/api';
import type { HttpRequest, HttpResponse } from './models';

export function sendEphemeralRequest(request: HttpRequest): Promise<HttpResponse> {
  // Remove some things that we don't want to associate
  const newRequest = { ...request, id: '', requestId: '', workspaceId: '' };
  return invoke('send_ephemeral_request', { request: newRequest });
}
