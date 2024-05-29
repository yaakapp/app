import classNames from 'classnames';
import { createGlobalState } from 'react-use';
import { useAppInfo } from '../../hooks/useAppInfo';
import { capitalize } from '../../lib/capitalize';
import { TabContent, Tabs } from '../core/Tabs/Tabs';
import { SettingsAppearance } from './SettingsAppearance';
import { SettingsDesign } from './SettingsDesign';
import { SettingsGeneral } from './SettingsGeneral';

enum Tab {
  General = 'general',
  Appearance = 'appearance',

  // Dev-only
  Design = 'design',
}

const tabs = [Tab.General, Tab.Appearance, Tab.Design];
const useTabState = createGlobalState<string>(tabs[0]!);

export const SettingsDialog = () => {
  const [tab, setTab] = useTabState();
  const appInfo = useAppInfo();
  const isDev = appInfo?.isDev ?? false;

  return (
    <div className={classNames('w-[70vw] max-w-[40rem]', 'h-[80vh]')}>
      <Tabs
        value={tab}
        addBorders
        label="Settings"
        onChangeValue={setTab}
        tabs={tabs
          .filter((t) => t !== Tab.Design || isDev)
          .map((value) => ({ value, label: capitalize(value) }))}
      >
        <TabContent value={Tab.General} className="pt-3 overflow-y-auto h-full px-4">
          <SettingsGeneral />
        </TabContent>
        <TabContent value={Tab.Appearance} className="pt-3 overflow-y-auto h-full px-4">
          <SettingsAppearance />
        </TabContent>
        <TabContent value={Tab.Design} className="pt-3 overflow-y-auto h-full px-4">
          <SettingsDesign />
        </TabContent>
      </Tabs>
    </div>
  );
};
