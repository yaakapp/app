import { memo, useCallback } from 'react';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarDisplayToggle = memo(function SidebarDisplayToggle() {
  const sidebarDisplay = useSidebarDisplay();
  const createRequest = useCreateRequest({ navigateAfter: true });
  const handleCreateRequest = useCallback(() => {
    createRequest.mutate({ name: 'New Request' });
  }, []);

  return (
    <HStack space={1}>
      <IconButton
        onClick={sidebarDisplay.toggle}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        icon={sidebarDisplay.hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <IconButton
        onClick={handleCreateRequest}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        icon="plusCircle"
      />
    </HStack>
  );
});
