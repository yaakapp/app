import classNames from 'classnames';
import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useOpenWorkspace } from '../hooks/useOpenWorkspace';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useRequests } from '../hooks/useRequests';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { Heading } from './core/Heading';
import { Icon } from './core/Icon';
import { PlainInput } from './core/PlainInput';

interface CommandPaletteGroup {
  key: string;
  label: string;
  items: CommandPaletteItem[];
}

interface CommandPaletteItem {
  key: string;
  label: string;
  onSelect: () => void;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const routes = useAppRoutes();
  const activeEnvironmentId = useActiveEnvironmentId();
  const workspaces = useWorkspaces();
  const recentWorkspaces = useRecentWorkspaces();
  const requests = useRequests();
  const recentRequests = useRecentRequests();
  const [command, setCommand] = useState<string>('');
  const openWorkspace = useOpenWorkspace();

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aRecentIndex = recentRequests.indexOf(a.id);
      const bRecentIndex = recentRequests.indexOf(b.id);

      if (aRecentIndex >= 0 && bRecentIndex >= 0) {
        return aRecentIndex - bRecentIndex;
      } else if (aRecentIndex >= 0 && bRecentIndex === -1) {
        return -1;
      } else if (aRecentIndex === -1 && bRecentIndex >= 0) {
        return 1;
      } else {
        return a.createdAt.localeCompare(b.createdAt);
      }
    });
  }, [recentRequests, requests]);

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort((a, b) => {
      const aRecentIndex = recentWorkspaces.indexOf(a.id);
      const bRecentIndex = recentWorkspaces.indexOf(b.id);

      if (aRecentIndex >= 0 && bRecentIndex >= 0) {
        return aRecentIndex - bRecentIndex;
      } else if (aRecentIndex >= 0 && bRecentIndex === -1) {
        return -1;
      } else if (aRecentIndex === -1 && bRecentIndex >= 0) {
        return 1;
      } else {
        return a.createdAt.localeCompare(b.createdAt);
      }
    });
  }, [recentWorkspaces, workspaces]);

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const requestGroup: CommandPaletteGroup = {
      key: 'requests',
      label: 'Requests',
      items: [],
    };

    for (const r of sortedRequests.slice(0, 4)) {
      requestGroup.items.push({
        key: `switch-request-${r.id}`,
        label: fallbackRequestName(r),
        onSelect: () => {
          return routes.navigate('request', {
            workspaceId: r.workspaceId,
            requestId: r.id,
            environmentId: activeEnvironmentId ?? undefined,
          });
        },
      });
    }

    const workspaceGroup: CommandPaletteGroup = {
      key: 'workspaces',
      label: 'Workspaces',
      items: [],
    };

    for (const w of sortedWorkspaces.slice(0, 4)) {
      workspaceGroup.items.push({
        key: `switch-workspace-${w.id}`,
        label: w.name,
        onSelect: () => openWorkspace.mutate({ workspace: w, inNewWindow: false }),
      });
    }

    return [requestGroup, workspaceGroup];
  }, [activeEnvironmentId, openWorkspace, routes, sortedRequests, sortedWorkspaces]);

  const filteredGroups = useMemo(
    () =>
      groups
        .map((g) => {
          g.items = g.items.filter((v) => v.label.toLowerCase().includes(command.toLowerCase()));
          return g;
        })
        .filter((g) => g.items.length > 0),
    [command, groups],
  );

  const handleSelectAndClose = useCallback(
    (cb: () => void) => {
      onClose();
      cb();
    },
    [onClose],
  );

  const { allItems, selectedItem } = useMemo(() => {
    const allItems = filteredGroups.flatMap((g) => g.items);
    let selectedItem = allItems.find((i) => i.key === selectedItemKey) ?? null;
    if (selectedItem == null) {
      selectedItem = allItems[0] ?? null;
    }
    return { selectedItem, allItems };
  }, [filteredGroups, selectedItemKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const index = allItems.findIndex((v) => v.key === selectedItem?.key);

      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
        const next = allItems[index + 1];
        setSelectedItemKey(next?.key ?? null);
      } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        const prev = allItems[index - 1];
        setSelectedItemKey(prev?.key ?? null);
      } else if (e.key === 'Enter') {
        const selected = allItems[index];
        setSelectedItemKey(selected?.key ?? null);
        if (selected) {
          handleSelectAndClose(selected.onSelect);
        }
      }
    },
    [allItems, handleSelectAndClose, selectedItem?.key],
  );

  return (
    <div className="h-full max-h-[20rem] w-[400px] grid grid-rows-[auto_minmax(0,1fr)]">
      <div className="px-2 py-2 w-full">
        <PlainInput
          hideLabel
          leftSlot={
            <div className="h-md w-10 flex justify-center items-center">
              <Icon icon="search" className="text-fg-subtle" />
            </div>
          }
          name="command"
          label="Command"
          placeholder="Search or type a command"
          className="font-sans !text-base"
          defaultValue=""
          onChange={setCommand}
          onKeyDownCapture={handleKeyDown}
        />
      </div>
      <div className="h-full px-1.5 overflow-y-auto pb-1">
        {filteredGroups.map((g) => (
          <div key={g.key} className="mb-1.5">
            <Heading size={2} className="!text-xs uppercase px-1.5 h-sm flex items-center">
              {g.label}
            </Heading>
            {g.items.map((v) => (
              <CommandPaletteItem
                active={v.key === selectedItem?.key}
                key={v.key}
                onClick={() => handleSelectAndClose(v.onSelect)}
              >
                {v.label}
              </CommandPaletteItem>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommandPaletteItem({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      tabIndex={active ? undefined : -1}
      className={classNames(
        'w-full h-sm flex items-center rounded px-1.5',
        'hover:text-fg',
        active && 'bg-background-highlight-secondary text-fg',
        !active && 'text-fg-subtle',
      )}
    >
      <span className="truncate">{children}</span>
    </button>
  );
}
