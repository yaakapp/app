import { memo } from 'react';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { IconButton } from './core/IconButton';

export const SidebarActions = memo(function SidebarActions() {
  const { hidden, toggle } = useSidebarHidden();

  return (
    <IconButton
      onClick={toggle}
      className="pointer-events-auto"
      size="sm"
      title="Show sidebar"
      icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
    />
  );
});
