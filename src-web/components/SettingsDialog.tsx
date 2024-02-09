import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useSettings } from '../hooks/useSettings';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import { Checkbox } from './core/Checkbox';
import { Heading } from './core/Heading';
import { Input } from './core/Input';
import { Select } from './core/Select';
import { Separator } from './core/Separator';
import { VStack } from './core/Stacks';

export const SettingsDialog = () => {
  const workspace = useActiveWorkspace();
  const updateWorkspace = useUpdateWorkspace(workspace?.id ?? null);
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  if (settings == null || workspace == null) {
    return null;
  }

  return (
    <VStack space={2} className="mb-4">
      <Select
        name="appearance"
        label="Appearance"
        labelPosition="left"
        labelClassName="w-1/3"
        size="sm"
        value={settings.appearance}
        onChange={(appearance) => updateSettings.mutateAsync({ ...settings, appearance })}
        options={[
          {
            label: 'System',
            value: 'system',
          },
          {
            label: 'Light',
            value: 'light',
          },
          {
            label: 'Dark',
            value: 'dark',
          },
        ]}
      />

      <Select
        name="updateChannel"
        label="Update Channel"
        labelPosition="left"
        labelClassName="w-1/3"
        size="sm"
        value={settings.updateChannel}
        onChange={(updateChannel) => updateSettings.mutateAsync({ ...settings, updateChannel })}
        options={[
          {
            label: 'Release',
            value: 'stable',
          },
          {
            label: 'Early Bird (Beta)',
            value: 'beta',
          },
        ]}
      />

      <Separator className="my-4" />

      <Heading size={2}>
        Workspace{' '}
        <div className="inline-block ml-1 bg-gray-500 dark:bg-gray-300 px-2 py-0.5 text-sm rounded text-white dark:text-gray-900">
          {workspace.name}
        </div>
      </Heading>
      <VStack className="mt-1 w-full" space={3}>
        <Input
          size="sm"
          name="requestTimeout"
          label="Request Timeout (ms)"
          labelPosition="left"
          labelClassName="w-1/3"
          containerClassName="col-span-2"
          defaultValue={`${workspace.settingRequestTimeout}`}
          validate={(value) => parseInt(value) >= 0}
          onChange={(v) => updateWorkspace.mutateAsync({ settingRequestTimeout: parseInt(v) || 0 })}
        />

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
      </VStack>
    </VStack>
  );
};
