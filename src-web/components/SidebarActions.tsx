import { memo } from 'react';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateGrpcRequest } from '../hooks/useCreateGrpcRequest';
import { useCreateHttpRequest } from '../hooks/useCreateHttpRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { Dropdown } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createHttpRequest = useCreateHttpRequest();
  const createGrpcRequest = useCreateGrpcRequest();
  const createFolder = useCreateFolder();
  const { hidden, toggle } = useSidebarHidden();

  return (
    <HStack>
      <IconButton
        onClick={async () => {
          trackEvent('Sidebar', 'Toggle');
          await toggle();
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
            key: 'create-http-request',
            label: 'HTTP Request',
            hotKeyAction: 'http_request.create',
            onSelect: () => createHttpRequest.mutate({}),
          },
          {
            key: 'create-grpc-request',
            label: 'GRPC Request',
            onSelect: () => createGrpcRequest.mutate({}),
          },
          {
            key: 'create-folder',
            label: 'Folder',
            onSelect: () => createFolder.mutate({}),
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>
    </HStack>
  );
});
