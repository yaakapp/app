import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo, useCallback, useState } from 'react';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { getRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRequests } from '../hooks/useRequests';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { Input } from './core/Input';

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const routes = useAppRoutes();
  const activeEnvironmentId = useActiveEnvironmentId();
  const workspaces = useWorkspaces();
  const requests = useRequests();
  const [command, setCommand] = useState<string>('');

  const items = useMemo<{ label: string; onSelect: () => void; key: string }[]>(() => {
    const items = [];
    for (const r of requests) {
      items.push({
        key: `switch-request-${r.id}`,
        label: `Switch Request → ${fallbackRequestName(r)}`,
        onSelect: () => {
          return routes.navigate('request', {
            workspaceId: r.workspaceId,
            requestId: r.id,
            environmentId: activeEnvironmentId ?? undefined,
          });
        },
      });
    }
    for (const w of workspaces) {
      items.push({
        key: `switch-workspace-${w.id}`,
        label: `Switch Workspace → ${w.name}`,
        onSelect: async () => {
          const environmentId = (await getRecentEnvironments(w.id))[0];
          return routes.navigate('workspace', {
            workspaceId: w.id,
            environmentId,
          });
        },
      });
    }
    return items;
  }, [activeEnvironmentId, requests, routes, workspaces]);

  const filteredItems = useMemo(() => {
    return items.filter((v) => v.label.toLowerCase().includes(command.toLowerCase()));
  }, [command, items]);

  const handleSelectAndClose = useCallback(
    (cb: () => void) => {
      onClose();
      cb();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => prev - 1);
      } else if (e.key === 'Enter') {
        const item = filteredItems[selectedIndex];
        if (item) {
          handleSelectAndClose(item.onSelect);
        }
      }
    },
    [filteredItems, handleSelectAndClose, selectedIndex],
  );

  return (
    <div className="h-full grid grid-rows-[auto_minmax(0,1fr)]">
      <div className="px-2 py-2 w-full">
        <Input
          hideLabel
          name="command"
          label="Command"
          placeholder="Type a command"
          defaultValue=""
          onChange={setCommand}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="h-full px-1.5 overflow-y-auto">
        {filteredItems.map((v, i) => (
          <CommandPaletteItem
            active={i === selectedIndex}
            key={v.key}
            onClick={() => handleSelectAndClose(v.onSelect)}
          >
            {v.label}
          </CommandPaletteItem>
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
      className={classNames(
        'w-full h-xs flex items-center rounded px-1.5 text-gray-600',
        active && 'bg-highlightSecondary text-gray-800',
      )}
    >
      {children}
    </button>
  );
}
