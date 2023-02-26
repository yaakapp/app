import { invoke } from '@tauri-apps/api';
import { useQuery, UseQueryResult } from 'react-query';

interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Request extends BaseModel {
  name: string;
  url: string;
  body: string | null;
  method: string;
}

export interface Workspace extends BaseModel {
  name: string;
  description: string;
}

export function useWorkspaces(): UseQueryResult<Workspace[]> {
  return useQuery('workspaces', async () => {
    const workspaces = (await invoke('workspaces')) as Workspace[];
    return workspaces.map(convertDates);
  });
}

export function useRequests(): UseQueryResult<Request[]> {
  return useQuery('requests', async () => {
    const workspaces = (await invoke('workspaces')) as Workspace[];
    const requests = (await invoke('requests', { workspaceId: workspaces[0].id })) as Request[];
    return requests.map(convertDates);
  });
}

export function useWorkspace(): UseQueryResult<{ workspace: Workspace; requests: Request[] }> {
  return useQuery('workspace', async () => {
    const workspaces = (await invoke('workspaces')) as Workspace[];
    const requests = (await invoke('requests', { workspaceId: workspaces[0].id })) as Request[];
    return {
      workspace: convertDates(workspaces[0]),
      requests: requests.map(convertDates),
    };
  });
}

function convertDates<T extends BaseModel>(m: T): T {
  return {
    ...m,
    createdAt: convertDate(m.createdAt),
    updatedAt: convertDate(m.updatedAt),
    deletedAt: m.deletedAt ? convertDate(m.deletedAt) : null,
  };
}

function convertDate(d: string | Date): Date {
  const date = new Date(d);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - userTimezoneOffset);
}
