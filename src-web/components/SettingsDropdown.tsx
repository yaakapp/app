import { invoke, shell } from '@tauri-apps/api';
import { useRef } from 'react';
import { useAppVersion } from '../hooks/useAppVersion';
import { useExportData } from '../hooks/useExportData';
import { useImportData } from '../hooks/useImportData';
import { useUpdateMode } from '../hooks/useUpdateMode';
import { Button } from './core/Button';
import type { DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { VStack } from './core/Stacks';
import { useDialog } from './DialogContext';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { SettingsDialog } from './SettingsDialog';

export function SettingsDropdown() {
  const importData = useImportData();
  const exportData = useExportData();
  const appVersion = useAppVersion();
  const [updateMode, setUpdateMode] = useUpdateMode();
  const dropdownRef = useRef<DropdownRef>(null);
  const dialog = useDialog();

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          key: 'import-data',
          label: 'Import',
          leftSlot: <Icon icon="download" />,
          onSelect: () => {
            dialog.show({
              title: 'Import Data',
              size: 'sm',
              render: ({ hide }) => {
                return (
                  <VStack space={3}>
                    <p>Insomnia or Postman Collection v2/v2.1 formats are supported</p>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={async () => {
                        await importData.mutateAsync();
                        hide();
                      }}
                    >
                      Select File
                    </Button>
                  </VStack>
                );
              },
            });
          },
        },
        {
          key: 'export-data',
          label: 'Export',
          leftSlot: <Icon icon="upload" />,
          onSelect: () => exportData.mutate(),
        },
        {
          key: 'hotkeys',
          label: 'Keyboard shortcuts',
          hotkeyAction: 'hotkeys.showHelp',
          leftSlot: <Icon icon="keyboard" />,
          onSelect: () => {
            dialog.show({
              id: 'hotkey-help',
              title: 'Keyboard Shortcuts',
              size: 'sm',
              render: () => <KeyboardShortcutsDialog />,
            });
          },
        },
        {
          key: 'settings',
          label: 'Settings',
          hotkeyAction: 'settings.show',
          leftSlot: <Icon icon="gear" />,
          onSelect: () => {
            dialog.show({
              id: 'settings',
              size: 'md',
              title: 'Settings',
              render: () => <SettingsDialog />,
            });
          },
        },
        { type: 'separator', label: `Yaak v${appVersion.data}` },
        {
          key: 'update-mode',
          label: updateMode === 'stable' ? 'Enable Beta' : 'Disable Beta',
          onSelect: () => setUpdateMode(updateMode === 'stable' ? 'beta' : 'stable'),
          leftSlot: <Icon icon="rocket" />,
        },
        {
          key: 'update-check',
          label: 'Check for Updates',
          onSelect: () => invoke('check_for_updates'),
          leftSlot: <Icon icon="update" />,
        },
        {
          key: 'feedback',
          label: 'Feedback',
          onSelect: () => shell.open('https://yaak.canny.io'),
          leftSlot: <Icon icon="chat" />,
        },
      ]}
    >
      <IconButton size="sm" title="Main Menu" icon="gear" className="pointer-events-auto" />
    </Dropdown>
  );
}
