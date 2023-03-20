import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';

type Props = {
  className?: string;
};

export const WorkspaceDropdown = memo(function WorkspaceDropdown({ className }: Props) {
  const navigate = useNavigate();
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const activeWorkspaceId = useActiveWorkspaceId();
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems = workspaces.map((w) => ({
      label: w.name,
      leftSlot: activeWorkspaceId === w.id ? <Icon icon="check" /> : <Icon icon="empty" />,
      onSelect: () => {
        if (w.id === activeWorkspaceId) return;
        navigate(`/workspaces/${w.id}`);
      },
    }));

    return [
      ...workspaceItems,
      '-----',
      {
        label: 'New Workspace',
        value: 'new',
        leftSlot: <Icon icon="plus" />,
        onSelect: () => createWorkspace.mutate({ name: 'New Workspace' }),
      },
    ];
  }, [workspaces, activeWorkspaceId]);

  return (
    <Dropdown items={items}>
      <Button size="sm" className={classnames(className, '!px-2 truncate')} forDropdown>
        {activeWorkspace?.name ?? 'Unknown'}
      </Button>
    </Dropdown>
  );
});
