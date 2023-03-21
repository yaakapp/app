import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { act } from 'react-dom/test-utils';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDeleteWorkspace } from '../hooks/useDeleteWorkspace';
import { useRoutes } from '../hooks/useRoutes';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';

type Props = {
  className?: string;
};

export const WorkspaceDropdown = memo(function WorkspaceDropdown({ className }: Props) {
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const activeWorkspaceId = activeWorkspace?.id ?? null;
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });
  const deleteWorkspace = useDeleteWorkspace(activeWorkspaceId);
  const routes = useRoutes();

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
      '-----',
      {
        label: 'New Workspace',
        leftSlot: <Icon icon="plus" />,
        onSelect: () => createWorkspace.mutate({ name: 'New Workspace' }),
      },
      {
        label: 'Delete Workspace',
        leftSlot: <Icon icon="trash" />,
        onSelect: () => deleteWorkspace.mutate(),
      },
    ];
  }, [workspaces, activeWorkspaceId]);

  return (
    <Dropdown items={items}>
      <Button size="sm" className={classnames(className, '!px-2 truncate')} forDropdown>
        {activeWorkspace?.name}
      </Button>
    </Dropdown>
  );
});
