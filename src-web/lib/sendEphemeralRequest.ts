import { invoke } from '@tauri-apps/api';
import type { HttpRequest, HttpResponse } from './models';

export function sendEphemeralRequest(request: HttpRequest): Promise<HttpResponse> {
  return invoke('send_ephemeral_request', { request });
}
