import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import { Checkbox } from './core/Checkbox';
import { VStack } from './core/Stacks';

export const SettingsDialog = () => {
  const { appearance, toggleAppearance } = useTheme();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  if (settings == null) {
    return null;
  }

  return (
    <VStack space={2}>
      <Checkbox
        checked={settings.validateCertificates}
        title="Validate TLS Certificates"
        onChange={(validateCertificates) =>
          updateSettings.mutateAsync({ ...settings, validateCertificates })
        }
      />
      <Checkbox
        checked={settings.followRedirects}
        title="Follow Redirects"
        onChange={(followRedirects) => updateSettings.mutateAsync({ ...settings, followRedirects })}
      />
      <Checkbox checked={appearance === 'dark'} title="Dark Mode" onChange={toggleAppearance} />
    </VStack>
  );
};
