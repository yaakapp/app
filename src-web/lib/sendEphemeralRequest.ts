import { invoke } from '@tauri-apps/api';
import type { HttpRequest, HttpResponse } from './models';

export async function sendEphemeralRequest(
  request: HttpRequest,
  environmentId: string | null,
): Promise<HttpResponse> {
  // Remove some things that we don't want to associate
  const newRequest = { ...request };
  return invoke('send_ephemeral_request', { request: newRequest, environmentId });
}
