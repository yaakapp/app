import { createGlobalState } from 'react-use';
import { generateId } from '../lib/generateId';

const useGlobalState = createGlobalState<Record<string, string>>({});

export function useRequestUpdateKey(requestId: string | null) {
  const [keys, setKeys] = useGlobalState();
  const key = keys[requestId ?? 'n/a'];
  return {
    updateKey: `${requestId}::${key ?? 'default'}`,
    wasUpdatedExternally: (changedRequestId: string) => {
      setKeys((m) => ({ ...m, [changedRequestId]: generateId() }));
    },
  };
}
