import classNames from 'classnames';
import { useMemo, useRef } from 'react';
import { useKey, useKeyPressEvent } from 'react-use';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRequests } from '../hooks/useRequests';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import type { DropdownItem, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

export function RecentRequestsDropdown({ className }: Pick<ButtonProps, 'className'>) {
  const dropdownRef = useRef<DropdownRef>(null);
  const activeRequest = useActiveRequest();
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const requests = useRequests();
  const routes = useAppRoutes();
  const allRecentRequestIds = useRecentRequests();
  const recentRequestIds = useMemo(() => allRecentRequestIds.slice(1), [allRecentRequestIds]);

  // Toggle the menu on Cmd+k
  useKey('k', (e) => {
    if (e.metaKey) {
      e.preventDefault();
      dropdownRef.current?.toggle(0);
    }
  });

  // Handle key-up
  useKeyPressEvent('Control', undefined, () => {
    dropdownRef.current?.select?.();
  });

  useKey(
    'Tab',
    (e) => {
      if (!e.ctrlKey || recentRequestIds.length === 0) return;

      if (!dropdownRef.current?.isOpen) {
        dropdownRef.current?.open(e.shiftKey ? -1 : 0);
        return;
      }

      if (e.shiftKey) dropdownRef.current?.prev?.();
      else dropdownRef.current?.next?.();
    },
    undefined,
    [recentRequestIds.length],
  );

  const items = useMemo<DropdownItem[]>(() => {
    if (activeWorkspaceId === null) return [];

    const recentRequestItems: DropdownItem[] = [];
    for (const id of recentRequestIds) {
      const request = requests.find((r) => r.id === id);
      if (request === undefined) continue;

      recentRequestItems.push({
        key: request.id,
        label: request.name,
        // leftSlot: <CountBadge className="!ml-0 px-0 w-5" count={recentRequestItems.length + 1} />,
        onSelect: () => {
          routes.navigate('request', {
            requestId: request.id,
            environmentId: activeEnvironmentId ?? undefined,
            workspaceId: activeWorkspaceId,
          });
        },
      });
    }

    // No recent requests to show
    if (recentRequestItems.length === 0) {
      return [
        {
          label: 'No recent requests',
          disabled: true,
        },
      ] as DropdownItem[];
    }

    return recentRequestItems.slice(0, 20);
  }, [activeWorkspaceId, activeEnvironmentId, recentRequestIds, requests, routes]);

  return (
    <Dropdown ref={dropdownRef} items={items}>
      <Button
        data-tauri-drag-region
        size="sm"
        className={classNames(
          className,
          'text-gray-800 text-sm truncate pointer-events-auto',
          activeRequest === null && 'text-opacity-disabled italic',
        )}
      >
        {activeRequest?.name ?? 'No Request'}
      </Button>
    </Dropdown>
  );
}
