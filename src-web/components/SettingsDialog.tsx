import classNames from 'classnames';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useSettings } from '../hooks/useSettings';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { Checkbox } from './core/Checkbox';
import { Input } from './core/Input';
import { HStack, VStack } from './core/Stacks';

export const SettingsDialog = () => {
  const workspace = useActiveWorkspace();
  const updateWorkspace = useUpdateWorkspace(workspace?.id ?? null);
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  if (settings == null || workspace == null) {
    return null;
  }

  return (
    <VStack space={2}>
      <VStack className="w-full" space={3}>
        <Checkbox
          checked={workspace.settingValidateCertificates}
          title="Validate TLS Certificates"
          onChange={(settingValidateCertificates) =>
            updateWorkspace.mutateAsync({ settingValidateCertificates })
          }
        />

        <Checkbox
          checked={workspace.settingFollowRedirects}
          title="Follow Redirects"
          onChange={(settingFollowRedirects) =>
            updateWorkspace.mutateAsync({ settingFollowRedirects })
          }
        />

        <Input
          size="xs"
          name="requestTimeout"
          label="Request Timeout (ms)"
          labelPosition="left"
          labelClassName="w-1/3"
          containerClassName="col-span-2"
          defaultValue={`${workspace.settingRequestTimeout}`}
          validate={(value) => parseInt(value) >= 0}
          onChange={(v) => updateWorkspace.mutateAsync({ settingRequestTimeout: parseInt(v) || 0 })}
        />

        <HStack alignItems="center" space={2}>
          <div className="w-1/3">Appearance</div>
          <select
            value={settings.appearance}
            style={selectBackgroundStyles}
            onChange={(e) =>
              updateSettings.mutateAsync({ ...settings, appearance: e.target.value })
            }
            className={classNames(
              'font-mono text-xs border w-full px-2 outline-none bg-transparent',
              'border-highlight focus:border-focus',
              'h-xs',
            )}
          >
            <option value="system">Match System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </HStack>
      </VStack>
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
