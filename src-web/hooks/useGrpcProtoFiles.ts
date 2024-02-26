import { NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function protoFilesArgs(requestId: string | null) {
  return {
    namespace: NAMESPACE_GLOBAL,
    key: ['proto_files', requestId ?? 'n/a'],
  };
}

export function useGrpcProtoFiles(activeRequestId: string | null) {
  return useKeyValue<string[]>({ ...protoFilesArgs(activeRequestId), fallback: [] });
}
