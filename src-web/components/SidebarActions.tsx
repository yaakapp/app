import { memo } from 'react';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { CreateDropdown } from './CreateDropdown';

export const SidebarActions = memo(function SidebarActions() {
  const { hidden, show, hide } = useSidebarHidden();

  return (
    <HStack className="h-full" alignItems="center">
      <IconButton
        onClick={async () => {
          trackEvent('sidebar', 'toggle');

          // NOTE: We're not using `toggle` because it may be out of sync
          // from changes in other windows
          if (hidden) await show();
          else await hide();
        }}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        hotkeyAction="sidebar.toggle"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <CreateDropdown>
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </CreateDropdown>
    </HStack>
  );
});
