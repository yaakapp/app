import classnames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown, DropdownMenuTrigger } from './core/Dropdown';
import { Icon } from './core/Icon';

type Props = {
  className?: string;
};

export function WorkspaceDropdown({ className }: Props) {
  const navigate = useNavigate();
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const createWorkspace = useCreateWorkspace({ navigateAfter: true });

  const items: DropdownItem[] = useMemo(() => {
    const workspaceItems = workspaces.map((w) => ({
      label: w.name,
      value: w.id,
      leftSlot: activeWorkspace?.id === w.id ? <Icon icon="check" /> : <Icon icon="empty" />,
      onSelect: () => {
        if (w.id === activeWorkspace?.id) return;
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
  }, [workspaces, activeWorkspace]);

  return (
    <Dropdown items={items}>
      <DropdownMenuTrigger>
        <Button size="sm" className={classnames(className, '!px-2 truncate')} forDropdown>
          {activeWorkspace?.name ?? 'Unknown'}
        </Button>
      </DropdownMenuTrigger>
    </Dropdown>
  );
}
