import { invoke } from '@tauri-apps/api';
import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useAlert } from '../hooks/useAlert';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { useExportData } from '../hooks/useExportData';
import { useImportData } from '../hooks/useImportData';
import { usePrompt } from '../hooks/usePrompt';
import { getRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useTheme } from '../hooks/useTheme';
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
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });
  const updateWorkspace = useUpdateWorkspace(activeWorkspaceId);
  const deleteWorkspace = useDeleteWorkspace(activeWorkspace);
  const importData = useImportData();
  const exportData = useExportData();
  const { appearance, toggleAppearance } = useTheme();
  const dialog = useDialog();
  const prompt = usePrompt();
  const alert = useAlert();
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
        label: 'New Workspace',
        leftSlot: <Icon icon="plus" />,
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
      {
        key: 'appearance',
        label: 'Toggle Theme',
        onSelect: toggleAppearance,
        leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
      },
      {
        key: 'import-data',
        label: 'Import Data',
        leftSlot: <Icon icon="download" />,
        onSelect: () => importData.mutate(),
      },
      {
        key: 'export-data',
        label: 'Export Data',
        leftSlot: <Icon icon="upload" />,
        onSelect: () => exportData.mutate(),
      },
    ];
  }, [
    activeWorkspace?.name,
    activeWorkspaceId,
    appearance,
    createWorkspace,
    deleteWorkspace.mutate,
    dialog,
    exportData,
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
