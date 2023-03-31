import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useConfirm } from '../hooks/useConfirm';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { useRoutes } from '../hooks/useRoutes';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';

type Props = {
  className?: string;
};

export const WorkspaceActionsDropdown = memo(function WorkspaceDropdown({ className }: Props) {
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const activeWorkspaceId = activeWorkspace?.id ?? null;
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });
  const deleteWorkspace = useDeleteWorkspace(activeWorkspaceId);
  const routes = useRoutes();
  const confirm = useConfirm();

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems = workspaces.map((w) => ({
      label: w.name,
      leftSlot: activeWorkspaceId === w.id ? <Icon icon="check" /> : <Icon icon="empty" />,
      onSelect: () => {
        if (w.id === activeWorkspaceId) return;
        routes.navigate('workspace', { workspaceId: w.id });
      },
    }));

    return [
      ...workspaceItems,
      {
        type: 'separator',
        label: 'Actions',
      },
      {
        label: 'New Workspace',
        leftSlot: <Icon icon="plus" />,
        onSelect: () => createWorkspace.mutate({ name: 'New Workspace' }),
      },
      {
        label: 'Delete Workspace',
        leftSlot: <Icon icon="trash" />,
        onSelect: async () => {
          const confirmed = await confirm({
            title: 'Delete Workspace',
            variant: 'delete',
            description: (
              <>
                Are you sure you want to delete <InlineCode>{activeWorkspace?.name}</InlineCode>?
              </>
            ),
          });
          if (confirmed) {
            deleteWorkspace.mutate();
          }
        },
      },
    ];
  }, [workspaces, activeWorkspaceId]);

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classnames(className, 'text-gray-800 !px-2 truncate')}
        forDropdown
      >
        {activeWorkspace?.name}
      </Button>
    </Dropdown>
  );
});
