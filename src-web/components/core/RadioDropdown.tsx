import { useMemo } from 'react';
import type { DropdownItemSeparator, DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';

export type RadioDropdownItem<T = string | null> =
  | {
      type?: 'default';
      label: string;
      shortLabel?: string;
      value: T;
    }
  | DropdownItemSeparator;

export interface RadioDropdownProps<T = string | null> {
  value: T;
  onChange: (value: T) => void;
  items: RadioDropdownItem<T>[];
  children: DropdownProps['children'];
}

export function RadioDropdown<T = string | null>({
  value,
  items,
  onChange,
  children,
}: RadioDropdownProps<T>) {
  const dropdownItems = useMemo(
    () =>
      items.map((item) => {
        if (item.type === 'separator') {
          return item;
        } else {
          return {
            label: item.label,
            shortLabel: item.shortLabel,
            onSelect: () => onChange(item.value),
            leftSlot: <Icon icon={value === item.value ? 'check' : 'empty'} />,
          };
        }
      }),
    [items, value, onChange],
  );

  return <Dropdown items={dropdownItems}>{children}</Dropdown>;
}
