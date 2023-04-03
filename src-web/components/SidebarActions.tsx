import { memo, useCallback } from 'react';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useTauriEvent } from '../hooks/useTauriEvent';
import { IconButton } from './core/IconButton';

export const SidebarActions = memo(function SidebarDisplayToggle() {
  const { hidden, toggle } = useSidebarHidden();
  const activeRequestId = useActiveRequestId();
  const createRequest = useCreateRequest({ navigateAfter: true });
  const duplicateRequest = useDuplicateRequest({ id: activeRequestId, navigateAfter: true });
  const handleCreateRequest = useCallback(() => {
    createRequest.mutate({});
  }, [createRequest]);
  useTauriEvent('new_request', () => {
    createRequest.mutate({});
  });
  // TODO: Put this somewhere better
  useTauriEvent('duplicate_request', () => {
    duplicateRequest.mutate();
  });

  return (
    <>
      <IconButton
        onClick={toggle}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <IconButton
        onClick={handleCreateRequest}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        icon="plusCircle"
      />
    </>
  );
});
