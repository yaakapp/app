import { invoke } from '@tauri-apps/api';
import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCommand } from '../hooks/useCommands';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { usePrompt } from '../hooks/usePrompt';
import { getRecentEnvironments } from '../hooks/useRecentEnvironments';
import { getRecentRequests } from '../hooks/useRecentRequests';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { HStack } from './core/Stacks';
import { useDialog } from './DialogContext';

type Props = Pick<ButtonProps, 'className' | 'justify' | 'forDropdown' | 'leftSlot'>;

export const WorkspaceActionsDropdown = memo(function WorkspaceActionsDropdown({
  className,
  ...buttonProps
}: Props) {
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const activeWorkspaceId = activeWorkspace?.id ?? null;
  const updateWorkspace = useUpdateWorkspace(activeWorkspaceId);
  const deleteWorkspace = useDeleteWorkspace(activeWorkspace);
  const createWorkspace = useCommand('workspace.create');
  const dialog = useDialog();
  const prompt = usePrompt();
  const routes = useAppRoutes();

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems: DropdownItem[] = workspaces.map((w) => ({
      key: w.id,
      label: w.name,
      leftSlot: w.id === activeWorkspaceId ? <Icon icon="check" /> : <Icon icon="empty" />,
      onSelect: async () => {
        dialog.show({
          id: 'open-workspace',
          size: 'sm',
          title: 'Open Workspace',
          description: (
            <>
              Where would you like to open <InlineCode>{w.name}</InlineCode>?
            </>
          ),
          render: ({ hide }) => {
            return (
              <HStack
                space={2}
                justifyContent="start"
                alignItems="center"
                className="mt-4 mb-6 flex-row-reverse"
              >
                <Button
                  className="focus"
                  color="gray"
                  onClick={async () => {
                    hide();
                    const environmentId = (await getRecentEnvironments(w.id))[0];
                    const requestId = (await getRecentRequests(w.id))[0];
                    if (requestId != null) {
                      routes.navigate('request', { workspaceId: w.id, environmentId, requestId });
                    } else {
                      routes.navigate('workspace', { workspaceId: w.id, environmentId });
                    }
                  }}
                >
                  This Window
                </Button>
                <Button
                  className="focus"
                  color="gray"
                  rightSlot={<Icon icon="externalLink" />}
                  onClick={async () => {
                    hide();
                    const environmentId = (await getRecentEnvironments(w.id))[0];
                    const requestId = (await getRecentRequests(w.id))[0];
                    const path =
                      requestId != null
                        ? routes.paths.request({
                            workspaceId: w.id,
                            environmentId,
                            requestId,
                          })
                        : routes.paths.workspace({ workspaceId: w.id, environmentId });
                    await invoke('cmd_new_window', { url: path });
                  }}
                >
                  New Window
                </Button>
              </HStack>
            );
          },
        });
      },
    }));

    const activeWorkspaceItems: DropdownItem[] =
      workspaces.length <= 1
        ? []
        : [
            ...workspaceItems,
            {
              type: 'separator',
              label: activeWorkspace?.name,
            },
          ];

    return [
      ...activeWorkspaceItems,
      {
        key: 'rename',
        label: 'Rename',
        leftSlot: <Icon icon="pencil" />,
        onSelect: async () => {
          const name = await prompt({
            id: 'rename-workspace',
            title: 'Rename Workspace',
            description: (
              <>
                Enter a new name for <InlineCode>{activeWorkspace?.name}</InlineCode>
              </>
            ),
            name: 'name',
            label: 'Name',
            placeholder: 'New Name',
            defaultValue: activeWorkspace?.name,
          });
          updateWorkspace.mutate({ name });
        },
      },
      {
        key: 'delete',
        label: 'Delete',
        leftSlot: <Icon icon="trash" />,
        onSelect: deleteWorkspace.mutate,
        variant: 'danger',
      },
      { type: 'separator' },
      {
        key: 'create-workspace',
        label: 'New Workspace',
        leftSlot: <Icon icon="plus" />,
        onSelect: () => createWorkspace.mutate({}),
      },
    ];
  }, [
    activeWorkspace?.name,
    activeWorkspaceId,
    createWorkspace,
    deleteWorkspace.mutate,
    dialog,
    prompt,
    routes,
    updateWorkspace,
    workspaces,
  ]);

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classNames(
          className,
          'text-gray-800 !px-2 truncate',
          activeWorkspace === null && 'italic opacity-disabled',
        )}
        {...buttonProps}
      >
        {activeWorkspace?.name ?? 'Workspace'}
      </Button>
    </Dropdown>
  );
});
