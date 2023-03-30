import { createGlobalState } from 'react-use';
import { generateId } from '../lib/generateId';

const useGlobalState = createGlobalState<Record<string, string>>({});

export function useRequestUpdateKey(requestId: string | null) {
  const [keys, setKeys] = useGlobalState();
  return {
    updateKey: `${requestId}::${keys[requestId ?? 'n/a']}`,
    wasUpdatedExternally: (changedRequestId: string) => {
      setKeys((m) => ({ ...m, [changedRequestId]: generateId() }));
    },
  };
}
