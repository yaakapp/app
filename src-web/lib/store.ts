import { invoke } from '@tauri-apps/api';
import type { Environment, HttpRequest, Workspace } from './models';

export async function getRequest(id: string | null): Promise<HttpRequest | null> {
  if (id === null) return null;
  const request: HttpRequest = (await invoke('get_request', { id })) ?? null;
  if (request == null) {
    return null;
  }
  return request;
}

export async function getEnvironment(id: string | null): Promise<Environment | null> {
  if (id === null) return null;
  const environment: Environment = (await invoke('get_environment', { id })) ?? null;
  if (environment == null) {
    return null;
  }
  return environment;
}

export async function getWorkspace(id: string | null): Promise<Workspace | null> {
  if (id === null) return null;
  const workspace: Workspace = (await invoke('get_workspace', { id })) ?? null;
  if (workspace == null) {
    return null;
  }
  return workspace;
}
