import { getCurrent } from '@tauri-apps/api/webviewWindow';
import classNames from 'classnames';
import React from 'react';
import { useKeyPressEvent, useLocalStorage } from 'react-use';
import { useOsInfo } from '../../hooks/useOsInfo';
import { capitalize } from '../../lib/capitalize';
import { HStack } from '../core/Stacks';
import { TabContent, Tabs } from '../core/Tabs/Tabs';
import { HeaderSize } from '../HeaderSize';
import { WindowControls } from '../WindowControls';
import { SettingsAppearance } from './SettingsAppearance';
import { SettingsGeneral } from './SettingsGeneral';

enum Tab {
  General = 'general',
  Appearance = 'appearance',
}

const tabs = [Tab.General, Tab.Appearance];

export const Settings = () => {
  const osInfo = useOsInfo();
  const [tab, setTab] = useLocalStorage<string>('settings_tab', Tab.General);

  // Close settings window on escape
  // TODO: Could this be put in a better place? Eg. in Rust key listener when creating the window
  useKeyPressEvent('Escape', () => getCurrent().close());

  return (
    <div className={classNames('grid grid-rows-[auto_minmax(0,1fr)] h-full')}>
      <HeaderSize
        data-tauri-drag-region
        ignoreStoplights
        size="md"
        className="x-theme-appHeader bg-background text-fg-subtle flex items-center justify-center border-b border-background-highlight text-sm font-semibold"
      >
        <HStack
          space={2}
          justifyContent="center"
          className="w-full h-full grid grid-cols-[1fr_auto] pointer-events-none"
        >
          <div className={classNames(osInfo?.osType === 'macos' ? 'text-center' : 'pl-2')}>
            Settings
          </div>
          <WindowControls className="ml-auto" onlyX />
        </HStack>
      </HeaderSize>
      <Tabs
        value={tab}
        addBorders
        label="Settings"
        onChangeValue={setTab}
        tabs={tabs.map((value) => ({ value, label: capitalize(value) }))}
      >
        <TabContent value={Tab.General} className="pt-3 overflow-y-auto h-full px-4">
          <SettingsGeneral />
        </TabContent>
        <TabContent value={Tab.Appearance} className="pt-3 overflow-y-auto h-full px-4">
          <SettingsAppearance />
        </TabContent>
      </Tabs>
    </div>
  );
};
