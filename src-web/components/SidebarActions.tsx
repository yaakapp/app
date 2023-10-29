import { memo } from 'react';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { IconButton } from './core/IconButton';
import { useCreateRequest } from '../hooks/useCreateRequest';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const { hidden, toggle } = useSidebarHidden();

  if (!hidden) return null;

  return (
  <div>
        <IconButton
          size="sm"
          icon="plusCircle"
          title="Create Request"
          onClick={() => createRequest.mutate({})}
        />
    <IconButton
      onClick={toggle}
      className="pointer-events-auto"
      size="sm"
      title="Show sidebar"
      icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
    />
    </div>
  );
});
