import { useEffect, useState } from 'react';
import { InlineCode } from '../components/core/InlineCode';
import { useToast } from '../components/ToastContext';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useAtiveWorkspaceChangedToast() {
  const toast = useToast();
  const activeWorkspace = useActiveWorkspace();
  const [id, setId] = useState<string | null>(activeWorkspace?.id ?? null);

  useEffect(() => {
    // Early return if same or invalid active workspace
    if (id === activeWorkspace?.id || activeWorkspace == null) return;

    setId(activeWorkspace?.id ?? null);

    // Don't notify on first load
    if (id === null) return;

    toast.show({
      id: 'workspace-changed',
      timeout: 3000,
      message: (
        <>
          Switched workspace to <InlineCode>{activeWorkspace.name}</InlineCode>
        </>
      ),
    });
  }, [activeWorkspace, id, toast]);
}
