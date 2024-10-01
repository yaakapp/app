import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { usePrompt } from '../hooks/usePrompt';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Icon } from './core/Icon';
import type { RadioDropdownItem } from './core/RadioDropdown';
import { RadioDropdown } from './core/RadioDropdown';

type Props = {
  method: string;
  className?: string;
  onChange: (method: string) => void;
};

const radioItems: RadioDropdownItem<string>[] = [
  'GET',
  'PUT',
  'POST',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'QUERY',
  'HEAD',
].map((m) => ({
  value: m,
  label: m,
}));

export const RequestMethodDropdown = memo(function RequestMethodDropdown({
  method,
  onChange,
  className,
}: Props) {
  const prompt = usePrompt();
  const extraItems = useMemo<DropdownItem[]>(
    () => [
      {
        key: 'custom',
        label: 'CUSTOM',
        leftSlot: <Icon icon="sparkles" />,
        onSelect: async () => {
          const newMethod = await prompt({
            id: 'custom-method',
            label: 'Http Method',
            defaultValue: '',
            title: 'Custom Method',
            confirmText: 'Save',
            description: 'Enter a custom method name',
            placeholder: 'CUSTOM',
          });
          onChange(newMethod);
        },
      },
    ],
    [onChange, prompt],
  );

  return (
    <RadioDropdown value={method} items={radioItems} extraItems={extraItems} onChange={onChange}>
      <Button size="xs" className={classNames(className, 'text-text-subtle hover:text')}>
        {method.toUpperCase()}
      </Button>
    </RadioDropdown>
  );
});
