import React from 'react';
import { capitalize } from '../../lib/capitalize';
import { Banner } from '../core/Banner';
import { Button } from '../core/Button';
import { Editor } from '../core/Editor';
import type { IconProps } from '../core/Icon';
import { Icon } from '../core/Icon';
import { IconButton } from '../core/IconButton';
import { Input } from '../core/Input';

const buttonColors = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'danger',
  'default',
] as const;

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

export function SettingsDesign() {
  return (
    <div className="p-2 flex flex-col gap-3">
      <Input
        label="Field Label"
        name="demo"
        placeholder="Placeholder"
        size="sm"
        rightSlot={<IconButton title="search" size="xs" className="w-8 m-0.5" icon="search" />}
      />
      <Editor
        defaultValue={[
          '// Demo code editor',
          'let foo = {',
          '  foo: ("bar" || "baz" ?? \'qux\'),',
          '  baz: [1, 10.2, null, false, true],',
          '};',
        ].join('\n')}
        heightMode="auto"
        contentType="application/javascript"
      />
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1">
          {buttonColors.map((c, i) => (
            <Button key={c} color={c} size="sm" leftSlot={<Icon size="sm" icon={icons[i]!} />}>
              {capitalize(c).slice(0, 4)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {buttonColors.map((c, i) => (
            <Button
              key={c}
              color={c}
              variant="border"
              size="sm"
              leftSlot={<Icon size="sm" icon={icons[i]!} />}
            >
              {capitalize(c).slice(0, 4)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {icons.map((v, i) => (
            <IconButton
              color={buttonColors[i % buttonColors.length]}
              title={v}
              variant="border"
              size="sm"
              key={v}
              icon={v}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Banner color="primary">Primary banner</Banner>
        <Banner color="secondary">Secondary banner</Banner>
        <Banner color="danger">Danger banner</Banner>
        <Banner color="warning">Warning banner</Banner>
        <Banner color="success">Success banner</Banner>
      </div>
    </div>
  );
}
