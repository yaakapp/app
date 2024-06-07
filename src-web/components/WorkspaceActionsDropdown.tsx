import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useCommand } from '../hooks/useCommands';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { useOpenWorkspace } from '../hooks/useOpenWorkspace';
import { usePrompt } from '../hooks/usePrompt';
import { useSettings } from '../hooks/useSettings';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { useDialog } from './DialogContext';
import { OpenWorkspaceDialog } from './OpenWorkspaceDialog';

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
  const settings = useSettings();
  const openWorkspace = useOpenWorkspace();
  const openWorkspaceNewWindow = settings?.openWorkspaceNewWindow ?? null;

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems: DropdownItem[] = workspaces.map((w) => ({
      key: w.id,
      label: w.name,
      leftSlot: w.id === activeWorkspaceId ? <Icon icon="check" /> : <Icon icon="empty" />,
      onSelect: async () => {
        if (typeof openWorkspaceNewWindow === 'boolean') {
          openWorkspace.mutate({ workspace: w, inNewWindow: openWorkspaceNewWindow });
          return;
        }

        dialog.show({
          id: 'open-workspace',
          size: 'sm',
          title: 'Open Workspace',
          render: ({ hide }) => <OpenWorkspaceDialog workspace={w} hide={hide} />,
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
    openWorkspace,
    prompt,
    openWorkspaceNewWindow,
    updateWorkspace,
    workspaces,
  ]);

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classNames(
          className,
          'text-fg !px-2 truncate',
          activeWorkspace === null && 'italic opacity-disabled',
        )}
        {...buttonProps}
      >
        {activeWorkspace?.name ?? 'Workspace'}
      </Button>
    </Dropdown>
  );
});
