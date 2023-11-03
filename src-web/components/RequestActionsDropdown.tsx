import { invoke } from '@tauri-apps/api';
import { useCallback, useRef } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useTheme } from '../hooks/useTheme';
import type { DropdownItem, DropdownProps, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { HotKey } from './core/HotKey';
import { Icon } from './core/Icon';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useAppRoutes } from '../hooks/useAppRoutes';
import type { Environment, HttpRequest, Workspace } from '../lib/models';
import { useDialog } from './DialogContext';
import { pluralize } from '../lib/pluralize';

interface Props {
  requestId: string | null;
  children: DropdownProps['children'];
}

export function RequestActionsDropdown({ requestId, children }: Props) {
  const deleteRequest = useDeleteRequest(requestId);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });
  const dropdownRef = useRef<DropdownRef>(null);
  const routes = useAppRoutes();
  const dialog = useDialog();
  const { appearance, toggleAppearance } = useTheme();

  useListenToTauriEvent('toggle_settings', () => {
    dropdownRef.current?.toggle();
  });

  // TODO: Put this somewhere better
  useListenToTauriEvent('duplicate_request', () => {
    duplicateRequest.mutate();
  });

  const importData = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Export File',
          extensions: ['json'],
        },
      ],
    });
    if (selected == null || selected.length === 0) return;
    const imported: {
      workspaces: Workspace[];
      environments: Environment[];
      requests: HttpRequest[];
    } = await invoke('import_data', {
      filePaths: selected,
      workspaceId: null,
    });
    const importedWorkspace = imported.workspaces[0];

    dialog.show({
      title: 'Import Complete',
      description: 'Imported the following:',
      size: 'dynamic',
      render: () => {
        const { workspaces, environments, requests } = imported;
        return (
          <div>
            <ul className="list-disc pl-6">
              <li>
                {workspaces.length} {pluralize('Workspace', workspaces.length)}
              </li>
              <li>
                {environments.length} {pluralize('Environment', environments.length)}
              </li>
              <li>
                {requests.length} {pluralize('Request', requests.length)}
              </li>
            </ul>
          </div>
        );
      },
    });

    if (importedWorkspace != null) {
      routes.navigate('workspace', {
        workspaceId: importedWorkspace.id,
        environmentId: imported.environments[0]?.id,
      });
    }
  }, [routes, dialog]);

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        ...(requestId != null
          ? ([
              {
                key: 'duplicate',
                label: 'Duplicate',
                onSelect: duplicateRequest.mutate,
                leftSlot: <Icon icon="copy" />,
                rightSlot: <HotKey modifier="Meta" keyName="D" />,
              },
              {
                key: 'delete',
                label: 'Delete',
                onSelect: deleteRequest.mutate,
                variant: 'danger',
                leftSlot: <Icon icon="trash" />,
              },
              { type: 'separator', label: 'Yaak Settings' },
            ] as DropdownItem[])
          : []),
        {
          key: 'import',
          label: 'Import',
          onSelect: importData,
          leftSlot: <Icon icon="download" />,
        },
        {
          key: 'appearance',
          label: appearance === 'dark' ? 'Light Theme' : 'Dark Theme',
          onSelect: toggleAppearance,
          leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
