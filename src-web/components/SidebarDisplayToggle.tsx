import { memo } from 'react';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { IconButton } from './core/IconButton';

export const SidebarDisplayToggle = memo(function SidebarDisplayToggle() {
  const sidebarDisplay = useSidebarDisplay();
  return (
    <IconButton
      onClick={sidebarDisplay.toggle}
      className="pointer-events-auto"
      size="sm"
      title="Show sidebar"
      icon="hamburger"
    />
  );
});
