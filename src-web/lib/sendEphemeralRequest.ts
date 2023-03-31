import { invoke } from '@tauri-apps/api';
import type { HttpRequest, HttpResponse } from './models';

export function sendEphemeralRequest(request: HttpRequest): Promise<HttpResponse> {
  // Ensure it's not associated with an ID
  const newRequest = { ...request, id: '' };
  return invoke('send_ephemeral_request', { request: newRequest });
}
