import { memo } from 'react';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useHotkey } from '../hooks/useHotkey';
import { usePrompt } from '../hooks/usePrompt';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { Dropdown } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const createFolder = useCreateFolder();
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });
  const prompt = usePrompt();
  const { hidden, toggle } = useSidebarHidden();

  useHotkey('request.create', () => createRequest.mutate({}));

  return (
    <HStack>
      <IconButton
        onClick={toggle}
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
            hotkeyAction: 'request.create',
            onSelect: () => createRequest.mutate({}),
          },
          {
            key: 'create-folder',
            label: 'New Folder',
            onSelect: () => createFolder.mutate({}),
          },
          {
            key: 'create-workspace',
            label: 'New Workspace',
            onSelect: async () => {
              const name = await prompt({
                name: 'name',
                label: 'Name',
                defaultValue: 'My Workspace',
                title: 'New Workspace',
              });
              createWorkspace.mutate({ name });
            },
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>
    </HStack>
  );
});
