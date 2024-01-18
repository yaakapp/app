import { invoke, shell } from '@tauri-apps/api';
import { useRef, useState } from 'react';
import { useAppVersion } from '../hooks/useAppVersion';
import { useExportData } from '../hooks/useExportData';
import { useImportData } from '../hooks/useImportData';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
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
  const dropdownRef = useRef<DropdownRef>(null);
  const dialog = useDialog();
  const [showChangelog, setShowChangelog] = useState<boolean>(false);

  useListenToTauriEvent('show_changelog', () => {
    setShowChangelog(true);
  });

  return (
    <Dropdown
      ref={dropdownRef}
      onClose={() => setShowChangelog(false)}
      items={[
        {
          key: 'settings',
          label: 'Settings',
          hotKeyAction: 'settings.show',
          leftSlot: <Icon icon="settings" />,
          onSelect: () => {
            dialog.show({
              id: 'settings',
              size: 'md',
              title: 'Settings',
              render: () => <SettingsDialog />,
            });
          },
        },
        {
          key: 'hotkeys',
          label: 'Keyboard shortcuts',
          hotKeyAction: 'hotkeys.showHelp',
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
          key: 'import-data',
          label: 'Import Data',
          leftSlot: <Icon icon="folderInput" />,
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
          label: 'Export Data',
          leftSlot: <Icon icon="folderOutput" />,
          onSelect: () => exportData.mutate(),
        },
        { type: 'separator', label: `Yaak v${appVersion.data}` },
        {
          key: 'update-check',
          label: 'Check for Updates',
          leftSlot: <Icon icon="update" />,
          onSelect: () => invoke('check_for_updates'),
        },
        {
          key: 'feedback',
          label: 'Feedback',
          leftSlot: <Icon icon="chat" />,
          rightSlot: <Icon icon="externalLink" />,
          onSelect: () => shell.open('https://yaak.canny.io'),
        },
        {
          key: 'changelog',
          label: 'Changelog',
          variant: showChangelog ? 'notify' : 'default',
          leftSlot: <Icon icon="cake" />,
          rightSlot: <Icon icon="externalLink" />,
          onSelect: () => shell.open(`https://yaak.app/changelog/${appVersion.data}`),
        },
      ]}
    >
      <IconButton
        size="sm"
        title="Main Menu"
        icon="settings"
        className="pointer-events-auto"
        showBadge={showChangelog}
      />
    </Dropdown>
  );
}
