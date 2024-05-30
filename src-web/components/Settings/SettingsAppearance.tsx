import React from 'react';
import { useActiveWorkspace } from '../../hooks/useActiveWorkspace';
import { useResolvedAppearance } from '../../hooks/useResolvedAppearance';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { useSettings } from '../../hooks/useSettings';
import { useThemes } from '../../hooks/useThemes';
import { useUpdateSettings } from '../../hooks/useUpdateSettings';
import { trackEvent } from '../../lib/analytics';
import { clamp } from '../../lib/clamp';
import { isThemeDark } from '../../lib/theme/window';
import type { ButtonProps } from '../core/Button';
import { Editor } from '../core/Editor';
import type { IconProps } from '../core/Icon';
import { IconButton } from '../core/IconButton';
import { PlainInput } from '../core/PlainInput';
import type { SelectOption } from '../core/Select';
import { Select } from '../core/Select';
import { Separator } from '../core/Separator';
import { HStack, VStack } from '../core/Stacks';

const buttonColors: ButtonProps['color'][] = [
  'primary',
  'info',
  'success',
  'notice',
  'warning',
  'danger',
  'secondary',
  'default',
];

const icons: IconProps['icon'][] = [
  'info',
  'box',
  'update',
  'alert',
  'arrowBigRightDash',
  'download',
  'copy',
  'magicWand',
  'settings',
  'trash',
  'sparkles',
  'pencil',
  'paste',
  'search',
  'sendHorizontal',
];

export function SettingsAppearance() {
  const workspace = useActiveWorkspace();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const appearance = useResolvedAppearance();
  const { themes } = useThemes();
  const activeTheme = useResolvedTheme();

  if (settings == null || workspace == null) {
    return null;
  }

  const lightThemes: SelectOption<string>[] = themes
    .filter((theme) => !isThemeDark(theme))
    .map((theme) => ({
      label: theme.name,
      value: theme.id,
    }));

  const darkThemes: SelectOption<string>[] = themes
    .filter((theme) => isThemeDark(theme))
    .map((theme) => ({
      label: theme.name,
      value: theme.id,
    }));

  return (
    <VStack space={2} className="mb-4">
      <PlainInput
        size="sm"
        name="interfaceFontSize"
        label="Font Size"
        placeholder="16"
        step={0.5}
        type="number"
        labelPosition="left"
        defaultValue={`${settings.interfaceFontSize}`}
        validate={(value) => parseInt(value) >= 8 && parseInt(value) <= 30}
        onChange={(v) =>
          updateSettings.mutate({
            ...settings,
            interfaceFontSize: clamp(parseInt(v) || 16, 8, 30),
          })
        }
      />
      <PlainInput
        size="sm"
        name="editorFontSize"
        label="Editor Font Size"
        placeholder="14"
        step={0.5}
        type="number"
        labelPosition="left"
        defaultValue={`${settings.editorFontSize}`}
        validate={(value) => parseInt(value) >= 8 && parseInt(value) <= 30}
        onChange={(v) =>
          updateSettings.mutate({
            ...settings,
            editorFontSize: clamp(parseInt(v) || 14, 8, 30),
          })
        }
      />

      <Separator className="my-4" />

      <Select
        name="appearance"
        label="Appearance"
        labelPosition="left"
        size="sm"
        value={settings.appearance}
        onChange={async (appearance) => {
          await updateSettings.mutateAsync({ ...settings, appearance });
          trackEvent('setting', 'update', { appearance });
        }}
        options={[
          { label: 'Automatic', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
      />
      {(settings.appearance === 'system' || settings.appearance === 'light') && (
        <Select
          name="lightTheme"
          label={settings.appearance === 'system' ? 'Light Theme' : 'Theme'}
          labelPosition="left"
          size="sm"
          value={activeTheme.light.id}
          options={lightThemes}
          onChange={async (themeLight) => {
            await updateSettings.mutateAsync({ ...settings, themeLight });
            trackEvent('setting', 'update', { themeLight });
          }}
        />
      )}
      {(settings.appearance === 'system' || settings.appearance === 'dark') && (
        <Select
          name="darkTheme"
          label={settings.appearance === 'system' ? 'Dark Theme' : 'Theme'}
          labelPosition="left"
          size="sm"
          value={activeTheme.dark.id}
          options={darkThemes}
          onChange={async (themeDark) => {
            await updateSettings.mutateAsync({ ...settings, themeDark });
            trackEvent('setting', 'update', { themeDark });
          }}
        />
      )}

      <VStack
        space={3}
        className="mt-3 w-full bg-background p-3 border border-dashed border-background-highlight rounded overflow-x-auto"
      >
        <div className="text-fg font-bold">
          Theme Preview <span className="text-fg-subtle">({appearance})</span>
        </div>
        <HStack space={1.5} alignItems="center" className="w-full">
          {buttonColors.map((c, i) => (
            <IconButton
              key={c}
              color={c}
              size="2xs"
              iconSize="xs"
              icon={icons[i % icons.length]!}
              iconClassName="text-fg"
              title={`${c}`}
            />
          ))}
          {buttonColors.map((c, i) => (
            <IconButton
              key={c}
              color={c}
              variant="border"
              size="2xs"
              iconSize="xs"
              icon={icons[i % icons.length]!}
              iconClassName="text-fg"
              title={`${c}`}
            />
          ))}
        </HStack>
        <Editor
          defaultValue={[
            'let foo = { // Demo code editor',
            '  foo: ("bar" || "baz" ?? \'qux\'),',
            '  baz: [1, 10.2, null, false, true],',
            '};',
          ].join('\n')}
          heightMode="auto"
          contentType="application/javascript"
        />
      </VStack>
    </VStack>
  );
}
