import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { useRequests } from '../hooks/useRequests';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { Input } from './core/Input';

export function CommandPalette() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const workspaces = useWorkspaces();
  const requests = useRequests();
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => prev + 1);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => prev - 1);
    }
  }, []);

  return (
    <div className="h-full grid grid-rows-[auto_minmax(0,1fr)]">
      <div className="px-2 py-2 w-full">
        <Input
          hideLabel
          name="command"
          label="Command"
          placeholder="Type a command"
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="h-full px-1.5 overflow-y-auto">
        {requests.map((r, i) => (
          <CommandPaletteItem active={i === selectedIndex} key={r.id}>
            Switch Request → {fallbackRequestName(r)}
          </CommandPaletteItem>
        ))}
        {workspaces.map((w, i) => (
          <CommandPaletteItem active={i === selectedIndex} key={w.id}>
            Switch Workspace → {w.name}
          </CommandPaletteItem>
        ))}
      </div>
    </div>
  );
}

function CommandPaletteItem({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <div
      className={classNames(
        'h-xs flex items-center rounded px-1.5 text-gray-600',
        active && 'bg-highlightSecondary text-gray-800',
      )}
    >
      {children}
    </div>
  );
}
