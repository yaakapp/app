import classNames from 'classnames';
import { search } from 'fast-fuzzy';
import type { KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveCookieJar } from '../hooks/useActiveCookieJar';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useCreateGrpcRequest } from '../hooks/useCreateGrpcRequest';
import { useCreateHttpRequest } from '../hooks/useCreateHttpRequest';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
import { useDebouncedState } from '../hooks/useDebouncedState';
import { useEnvironments } from '../hooks/useEnvironments';
import type { HotkeyAction } from '../hooks/useHotKey';
import { useHotKey } from '../hooks/useHotKey';
import { useOpenWorkspace } from '../hooks/useOpenWorkspace';
import { useRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useRequests } from '../hooks/useRequests';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { invokeCmd } from '../lib/tauri';
import { CookieDialog } from './CookieDialog';
import { Button } from './core/Button';
import { Heading } from './core/Heading';
import { HotKey } from './core/HotKey';
import { HttpMethodTag } from './core/HttpMethodTag';
import { Icon } from './core/Icon';
import { PlainInput } from './core/PlainInput';
import { HStack } from './core/Stacks';
import { useDialog } from './DialogContext';
import { EnvironmentEditDialog } from './EnvironmentEditDialog';

interface CommandPaletteGroup {
  key: string;
  label: ReactNode;
  items: CommandPaletteItem[];
}

type CommandPaletteItem = {
  key: string;
  onSelect: () => void;
  action?: HotkeyAction;
} & ({ searchText: string; label: ReactNode } | { label: string });

const MAX_PER_GROUP = 8;

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [command, setCommand] = useDebouncedState<string>('', 150);
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const routes = useAppRoutes();
  const activeEnvironmentId = useActiveEnvironmentId();
  const activeRequestId = useActiveRequestId();
  const active = useActiveWorkspaceId();
  const workspaces = useWorkspaces();
  const environments = useEnvironments();
  const recentEnvironments = useRecentEnvironments();
  const recentWorkspaces = useRecentWorkspaces();
  const requests = useRequests();
  const recentRequests = useRecentRequests();
  const openWorkspace = useOpenWorkspace();
  const createWorkspace = useCreateWorkspace();
  const createHttpRequest = useCreateHttpRequest();
  const { activeCookieJar } = useActiveCookieJar();
  const createGrpcRequest = useCreateGrpcRequest();
  const createEnvironment = useCreateEnvironment();
  const dialog = useDialog();
  const workspaceId = useActiveWorkspaceId();
  const activeEnvironment = useActiveEnvironment();
  const [, setSidebarHidden] = useSidebarHidden();

  const workspaceCommands = useMemo<CommandPaletteItem[]>(() => {
    const commands: CommandPaletteItem[] = [
      {
        key: 'settings.open',
        label: 'Open Settings',
        action: 'settings.show',
        onSelect: async () => {
          if (workspaceId == null) return;
          await invokeCmd('cmd_new_nested_window', {
            url: routes.paths.workspaceSettings({ workspaceId }),
            label: 'settings',
            title: 'Yaak Settings',
          });
        },
      },
      {
        key: 'app.create',
        label: 'Create Workspace',
        onSelect: createWorkspace.mutate,
      },
      {
        key: 'http_request.create',
        label: 'Create HTTP Request',
        onSelect: () => createHttpRequest.mutate({}),
      },
      {
        key: 'cookies.show',
        label: 'Show Cookies',
        onSelect: async () => {
          dialog.show({
            id: 'cookies',
            title: 'Manage Cookies',
            size: 'full',
            render: () => <CookieDialog cookieJarId={activeCookieJar?.id ?? null} />,
          });
        },
      },
      {
        key: 'grpc_request.create',
        label: 'Create GRPC Request',
        onSelect: () => createGrpcRequest.mutate({}),
      },
      {
        key: 'environment.edit',
        label: 'Edit Environment',
        action: 'environmentEditor.toggle',
        onSelect: () => {
          dialog.toggle({
            id: 'environment-editor',
            noPadding: true,
            size: 'lg',
            className: 'h-[80vh]',
            render: () => <EnvironmentEditDialog initialEnvironment={activeEnvironment} />,
          });
        },
      },
      {
        key: 'environment.create',
        label: 'Create Environment',
        onSelect: createEnvironment.mutate,
      },
      {
        key: 'sidebar.toggle',
        label: 'Toggle Sidebar',
        action: 'sidebar.focus',
        onSelect: () => setSidebarHidden((h) => !h),
      },
    ];
    return commands.sort((a, b) =>
      ('searchText' in a ? a.searchText : a.label).localeCompare(
        'searchText' in b ? b.searchText : b.label,
      ),
    );
  }, [
    activeCookieJar,
    activeEnvironment,
    createEnvironment.mutate,
    createGrpcRequest,
    createHttpRequest,
    createWorkspace.mutate,
    dialog,
    routes.paths,
    setSidebarHidden,
    workspaceId,
  ]);

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

  const sortedEnvironments = useMemo(() => {
    return [...environments].sort((a, b) => {
      const aRecentIndex = recentEnvironments.indexOf(a.id);
      const bRecentIndex = recentEnvironments.indexOf(b.id);

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
  }, [environments, recentEnvironments]);

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
    const actionsGroup: CommandPaletteGroup = {
      key: 'actions',
      label: 'Actions',
      items: workspaceCommands,
    };

    const requestGroup: CommandPaletteGroup = {
      key: 'requests',
      label: 'Requests',
      items: [],
    };

    for (const r of sortedRequests) {
      if (r.id === activeRequestId) {
        continue;
      }

      requestGroup.items.push({
        key: `switch-request-${r.id}`,
        searchText: fallbackRequestName(r),
        label: (
          <HStack space={2}>
            <HttpMethodTag className="text-fg-subtler" request={r} />
            <div className="truncate">{fallbackRequestName(r)}</div>
          </HStack>
        ),
        onSelect: () => {
          return routes.navigate('request', {
            workspaceId: r.workspaceId,
            requestId: r.id,
            environmentId: activeEnvironmentId ?? undefined,
          });
        },
      });
    }

    const environmentGroup: CommandPaletteGroup = {
      key: 'environments',
      label: 'Environments',
      items: [],
    };

    for (const e of sortedEnvironments) {
      if (e.id === activeEnvironment?.id) {
        continue;
      }
      environmentGroup.items.push({
        key: `switch-environment-${e.id}`,
        label: e.name,
        onSelect: () => routes.setEnvironment(e),
      });
    }

    const workspaceGroup: CommandPaletteGroup = {
      key: 'workspaces',
      label: 'Workspaces',
      items: [],
    };

    for (const w of sortedWorkspaces) {
      if (w.id === active) {
        continue;
      }
      workspaceGroup.items.push({
        key: `switch-workspace-${w.id}`,
        label: w.name,
        onSelect: () => openWorkspace.mutate({ workspaceId: w.id, inNewWindow: false }),
      });
    }

    return [actionsGroup, requestGroup, environmentGroup, workspaceGroup];
  }, [
    workspaceCommands,
    sortedRequests,
    activeRequestId,
    routes,
    activeEnvironmentId,
    sortedEnvironments,
    activeEnvironment?.id,
    sortedWorkspaces,
    active,
    openWorkspace,
  ]);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    setSelectedItemKey(null);
  }, [command]);

  const { filteredGroups, filteredAllItems } = useMemo(() => {
    const result = command
      ? search(command, allItems, {
          threshold: 0.5,
          keySelector: (v) => ('searchText' in v ? v.searchText : v.label),
        })
      : allItems;

    const filteredGroups = groups
      .map((g) => {
        g.items = result.filter((i) => g.items.includes(i)).slice(0, MAX_PER_GROUP);
        return g;
      })
      .filter((g) => g.items.length > 0);

    const filteredAllItems = filteredGroups.flatMap((g) => g.items);
    return { filteredAllItems, filteredGroups };
  }, [allItems, command, groups]);

  const handleSelectAndClose = useCallback(
    (cb: () => void) => {
      onClose();
      cb();
    },
    [onClose],
  );

  const selectedItem = useMemo(() => {
    let selectedItem = filteredAllItems.find((i) => i.key === selectedItemKey) ?? null;
    if (selectedItem == null) {
      selectedItem = filteredAllItems[0] ?? null;
    }
    return selectedItem;
  }, [filteredAllItems, selectedItemKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const index = filteredAllItems.findIndex((v) => v.key === selectedItem?.key);

      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
        const next = filteredAllItems[index + 1] ?? filteredAllItems[0];
        setSelectedItemKey(next?.key ?? null);
      } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        const prev = filteredAllItems[index - 1] ?? filteredAllItems[filteredAllItems.length - 1];
        setSelectedItemKey(prev?.key ?? null);
      } else if (e.key === 'Enter') {
        const selected = filteredAllItems[index];
        setSelectedItemKey(selected?.key ?? null);
        if (selected) {
          handleSelectAndClose(selected.onSelect);
        }
      }
    },
    [filteredAllItems, handleSelectAndClose, selectedItem?.key],
  );

  return (
    <div className="h-full w-[400px] grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
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
          defaultValue={command}
          onChange={setCommand}
          onKeyDownCapture={handleKeyDown}
        />
      </div>
      <div className="h-full px-1.5 overflow-y-auto pb-1">
        {filteredGroups.map((g) => (
          <div key={g.key} className="mb-1.5 w-full">
            <Heading size={2} className="!text-xs uppercase px-1.5 h-sm flex items-center">
              {g.label}
            </Heading>
            {g.items.map((v) => (
              <CommandPaletteItem
                active={v.key === selectedItem?.key}
                key={v.key}
                onClick={() => handleSelectAndClose(v.onSelect)}
                rightSlot={
                  v.action && <CommandPaletteAction action={v.action} onAction={v.onSelect} />
                }
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
  rightSlot,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  rightSlot?: ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      tabIndex={active ? undefined : -1}
      rightSlot={rightSlot}
      color="custom"
      justify="start"
      className={classNames(
        'w-full h-sm flex items-center rounded px-1.5',
        'hover:text-fg',
        active && 'bg-background-highlight-secondary text-fg',
        !active && 'text-fg-subtle',
      )}
    >
      <span className="truncate">{children}</span>
    </Button>
  );
}

function CommandPaletteAction({
  action,
  onAction,
}: {
  action: HotkeyAction;
  onAction: () => void;
}) {
  useHotKey(action, onAction);
  return <HotKey className="ml-auto" action={action} />;
}
