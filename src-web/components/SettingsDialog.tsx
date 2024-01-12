import classNames from 'classnames';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import type { Appearance } from '../lib/theme/window';
import { Checkbox } from './core/Checkbox';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

export const SettingsDialog = () => {
  const { appearance, setAppearance } = useTheme();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  if (settings == null) {
    return null;
  }
  console.log('SETTINGS', settings);

  return (
    <VStack space={2}>
      <div className="w-full gap-2 grid grid-cols-[auto_1fr] gap-x-6 auto-rows-[2rem] items-center">
        <Checkbox
          className="col-span-full"
          checked={settings.validateCertificates}
          title="Validate TLS Certificates"
          onChange={(validateCertificates) =>
            updateSettings.mutateAsync({ ...settings, validateCertificates })
          }
        />

        <Checkbox
          className="col-span-full"
          checked={settings.followRedirects}
          title="Follow Redirects"
          onChange={(followRedirects) =>
            updateSettings.mutateAsync({ ...settings, followRedirects })
          }
        />

        <div>Request Timeout (ms)</div>
        <div>
          <Input
            size="sm"
            name="requestTimeout"
            label="Request Timeout (ms)"
            containerClassName="col-span-2"
            hideLabel
            defaultValue={`${settings.requestTimeout}`}
            validate={(value) => parseInt(value) >= 0}
            onChange={(v) =>
              updateSettings.mutateAsync({ ...settings, requestTimeout: parseInt(v) || 0 })
            }
          />
        </div>

        <div>Appearance</div>
        <select
          value={settings.appearance}
          style={selectBackgroundStyles}
          onChange={(e) => updateSettings.mutateAsync({ ...settings, appearance: e.target.value })}
          className={classNames(
            'border w-full px-2 outline-none bg-transparent',
            'border-highlight focus:border-focus',
            'h-sm',
          )}
        >
          <option value="system">Match System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      {/*<Checkbox checked={appearance === 'dark'} title="Dark Mode" onChange={toggleAppearance} />*/}
    </VStack>
  );
};

const selectBackgroundStyles = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
};
