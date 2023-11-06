import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import classNames from 'classnames';
import { memo, useCallback, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { usePrompt } from '../hooks/usePrompt';
import { getRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useTheme } from '../hooks/useTheme';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Environment, Folder, HttpRequest, Workspace } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { HStack, VStack } from './core/Stacks';
import { useDialog } from './DialogContext';

type Props = Pick<ButtonProps, 'className' | 'justify' | 'forDropdown' | 'leftSlot'>;

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
  const { appearance, toggleAppearance } = useTheme();
  const dialog = useDialog();
  const prompt = usePrompt();
  const routes = useAppRoutes();

  const importData = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Export File',
          extensions: ['json'],
        },
      ],
    });
    if (selected == null || selected.length === 0) return;
    const imported: {
      workspaces: Workspace[];
      environments: Environment[];
      folders: Folder[];
      requests: HttpRequest[];
    } = await invoke('import_data', {
      filePaths: selected,
    });
    const importedWorkspace = imported.workspaces[0];

    dialog.show({
      title: 'Import Complete',
      size: 'dynamic',
      hideX: true,
      render: ({ hide }) => {
        const { workspaces, environments, folders, requests } = imported;
        return (
          <VStack space={3}>
            <ul className="list-disc pl-6">
              <li>
                {workspaces.length} {pluralize('Workspace', workspaces.length)}
              </li>
              <li>
                {environments.length} {pluralize('Environment', environments.length)}
              </li>
              <li>
                {folders.length} {pluralize('Folder', folders.length)}
              </li>
              <li>
                {requests.length} {pluralize('Request', requests.length)}
              </li>
            </ul>
            <div>
              <Button className="ml-auto" onClick={hide} color="primary">
                Done
              </Button>
            </div>
          </VStack>
        );
      },
    });

    if (importedWorkspace != null) {
      routes.navigate('workspace', {
        workspaceId: importedWorkspace.id,
        environmentId: imported.environments[0]?.id,
      });
    }
  }, [routes, dialog]);

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
              <HStack space={2} justifyContent="end" alignItems="center" className="mt-6">
                <Button
                  className="focus"
                  color="gray"
                  rightSlot={<Icon icon="openNewWindow" />}
                  onClick={async () => {
                    hide();
                    const environmentId = (await getRecentEnvironments(w.id))[0];
                    await invoke('new_window', {
                      url: routes.paths.workspace({ workspaceId: w.id, environmentId }),
                    });
                  }}
                >
                  New Window
                </Button>
                <Button
                  autoFocus
                  className="focus"
                  color="gray"
                  onClick={async () => {
                    hide();
                    const environmentId = (await getRecentEnvironments(w.id))[0];
                    routes.navigate('workspace', { workspaceId: w.id, environmentId });
                  }}
                >
                  This Window
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
            defaultValue: 'My Workspace',
            title: 'Create Workspace',
          });
          createWorkspace.mutate({ name });
        },
      },
      {
        key: 'import',
        label: 'Import Data',
        onSelect: importData,
        leftSlot: <Icon icon="download" />,
      },
      {
        key: 'appearance',
        label: 'Toggle Theme',
        onSelect: toggleAppearance,
        leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
      },
    ];
  }, [
    activeWorkspace?.name,
    activeWorkspaceId,
    appearance,
    createWorkspace,
    deleteWorkspace.mutate,
    dialog,
    importData,
    prompt,
    routes,
    toggleAppearance,
    updateWorkspace,
    workspaces,
  ]);

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classNames(className, 'text-gray-800 !px-2 truncate')}
        {...buttonProps}
      >
        {activeWorkspace?.name}
      </Button>
    </Dropdown>
  );
});
