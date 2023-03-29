import { useMemo } from 'react';
import type { DropdownItemSeparator, DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';

export type RadioDropdownItem =
  | {
      type?: 'default';
      label: string;
      shortLabel?: string;
      value: string | null;
    }
  | DropdownItemSeparator;

export interface RadioDropdownProps {
  value: string | null;
  onChange: (value: string | null) => void;
  items: RadioDropdownItem[];
  children: DropdownProps['children'];
}

export function RadioDropdown({ value, items, onChange, children }: RadioDropdownProps) {
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
    [value, items],
  );

  return <Dropdown items={dropdownItems}>{children}</Dropdown>;
}
