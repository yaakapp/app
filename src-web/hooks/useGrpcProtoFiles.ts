import { NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function useGrpcProtoFiles(activeRequestId: string | null) {
  return useKeyValue<string[]>({
    namespace: NAMESPACE_GLOBAL,
    key: ['proto_files', activeRequestId ?? 'n/a'],
    defaultValue: [],
  });
}
