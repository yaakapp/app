import { invoke } from '@tauri-apps/api';
import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { usePrompt } from '../hooks/usePrompt';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import type { ButtonProps } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { HStack } from './core/Stacks';
import { useDialog } from './DialogContext';

type Props = Pick<ButtonProps, 'className' | 'justify' | 'forDropdown'>;

export const WorkspaceActionsDropdown = memo(function WorkspaceActionsDropdown({
  className,
  ...buttonProps
}: Props) {
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const activeWorkspaceId = activeWorkspace?.id ?? null;
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });
  const updateWorkspace = useUpdateWorkspace(activeWorkspaceId);
  const deleteWorkspace = useDeleteWorkspace(activeWorkspace);
  const dialog = useDialog();
  const prompt = usePrompt();
  const routes = useAppRoutes();

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems: DropdownItem[] = workspaces.map((w) => ({
      key: w.id,
      label: w.name,
      rightSlot: w.id === activeWorkspaceId ? <Icon icon="check" /> : undefined,
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
              <HStack space={2} justifyContent="end" className="mt-6">
                <Button
                  className="focus"
                  color="gray"
                  onClick={() => {
                    hide();
                    routes.navigate('workspace', { workspaceId: w.id });
                  }}
                >
                  This Window
                </Button>
                <Button
                  autoFocus
                  className="focus"
                  color="gray"
                  rightSlot={<Icon icon="openNewWindow" />}
                  onClick={async () => {
                    hide();
                    await invoke('new_window', {
                      url: routes.paths.workspace({ workspaceId: w.id }),
                    });
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
            title: 'Rename Workspace',
            description: (
              <>
                Enter a new name for <InlineCode>{activeWorkspace?.name}</InlineCode>
              </>
            ),
            name: 'name',
            label: 'Name',
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
        label: 'Create Workspace',
        leftSlot: <Icon icon="plus" />,
        onSelect: async () => {
          const name = await prompt({
            name: 'name',
            label: 'Name',
            defaultValue: '',
            description: 'Enter a name for the new workspace',
            title: 'Create Workspace',
          });
          createWorkspace.mutate({ name });
        },
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
        className={classNames(className, 'text-gray-800 !px-2 truncate')}
        forDropdown
        leftSlot={
          <img src="https://yaak.app/logo.svg" alt="Workspace logo" className="w-4 h-4 mr-1" />
        }
        {...buttonProps}
      >
        {activeWorkspace?.name}
      </Button>
    </Dropdown>
  );
});
