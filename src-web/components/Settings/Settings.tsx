import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { createGlobalState, useKeyPressEvent } from 'react-use';
import { capitalize } from '../../lib/capitalize';
import { TabContent, Tabs } from '../core/Tabs/Tabs';
import { SettingsAppearance } from './SettingsAppearance';
import { SettingsGeneral } from './SettingsGeneral';

enum Tab {
  General = 'general',
  Appearance = 'appearance',
}

const tabs = [Tab.General, Tab.Appearance];
const useTabState = createGlobalState<string>(tabs[0]!);

export const Settings = () => {
  const [tab, setTab] = useTabState();

  // Close settings window on escape
  // TODO: Could this be put in a better place? Eg. in Rust key listener when creating the window
  useKeyPressEvent('Escape', () => getCurrent().close());

  return (
    <>
      <div
        data-tauri-drag-region
        className="h-[27px] bg-background-highlight-secondary flex items-center justify-center border-b border-background-highlight"
      >
        Settings
      </div>
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
    </>
  );
};
