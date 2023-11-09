import { memo } from 'react';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const createFolder = useCreateFolder();
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
      <Dropdown
        items={[
          {
            key: 'create-request',
            label: 'New Request',
            leftSlot: <Icon icon="plus" />,
            onSelect: () => createRequest.mutate({}),
          },
          {
            key: 'create-folder',
            label: 'New Folder',
            leftSlot: <Icon icon="plus" />,
            onSelect: () => createFolder.mutate({}),
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>
    </HStack>
  );
});
