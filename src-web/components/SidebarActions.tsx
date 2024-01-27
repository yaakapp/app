import { memo } from 'react';
import { useCreateCookieJar } from '../hooks/useCreateCookieJar';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { Dropdown } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const createFolder = useCreateFolder();
  const createCookieJar = useCreateCookieJar();
  const { hidden, toggle } = useSidebarHidden();

  return (
    <HStack>
      <IconButton
        onClick={() => {
          trackEvent('Sidebar', 'Toggle');
          toggle();
        }}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        hotkeyAction="sidebar.toggle"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <Dropdown
        items={[
          {
            key: 'create-request',
            label: 'New Request',
            hotKeyAction: 'request.create',
            onSelect: () => createRequest.mutate({}),
          },
          {
            key: 'create-folder',
            label: 'New Folder',
            onSelect: () => createFolder.mutate({}),
          },
          {
            key: 'create-cookie-jar',
            label: 'New Cookie Jar',
            onSelect: () => createCookieJar.mutate(),
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>
    </HStack>
  );
});
