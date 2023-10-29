import { memo } from 'react';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { IconButton } from './core/IconButton';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const { hidden, toggle } = useSidebarHidden();

  return (
    <HStack>
      {hidden && (
        <IconButton
          onClick={toggle}
          className="pointer-events-auto"
          size="sm"
          title="Show sidebar"
          icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
        />
      )}
      <IconButton
        size="sm"
        icon="plusCircle"
        title="Create Request"
        onClick={() => createRequest.mutate({})}
      />
    </HStack>
  );
});
