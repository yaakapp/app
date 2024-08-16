import { getKeyValue, setKeyValue } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function protoFilesArgs(requestId: string | null) {
  return {
    namespace: 'global' as const,
    key: ['proto_files', requestId ?? 'n/a'],
  };
}

export function useGrpcProtoFiles(activeRequestId: string | null) {
  return useKeyValue<string[]>({ ...protoFilesArgs(activeRequestId), fallback: [] });
}

export async function getGrpcProtoFiles(requestId: string) {
  return getKeyValue<string[]>({ ...protoFilesArgs(requestId), fallback: [] });
}

export async function setGrpcProtoFiles(requestId: string, protoFiles: string[]) {
  return setKeyValue<string[]>({ ...protoFilesArgs(requestId), value: protoFiles });
}
