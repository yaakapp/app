import { memo, useCallback } from 'react';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useTauriEvent } from '../hooks/useTauriEvent';
import { IconButton } from './core/IconButton';

export const SidebarActions = memo(function SidebarActions() {
  const { hidden, toggle } = useSidebarHidden();
  const createRequest = useCreateRequest({ navigateAfter: true });

  const handleCreateRequest = useCallback(() => {
    createRequest.mutate({});
  }, [createRequest]);

  useTauriEvent('new_request', () => {
    createRequest.mutate({});
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
