import { useMemo } from 'react';
import type { DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';

export interface RadioDropdownItem<T> {
  label: string;
  shortLabel?: string;
  value: T;
}

export interface RadioDropdownProps<T = string | null> {
  value: T;
  onChange: (value: T) => void;
  items: RadioDropdownItem<T>[];
  children: DropdownProps['children'];
}

export function RadioDropdown<T>({ value, items, onChange, children }: RadioDropdownProps<T>) {
  const dropdownItems = useMemo(
    () =>
      items.map(({ label, shortLabel, value: v }) => ({
        label,
        shortLabel,
        onSelect: () => onChange(v),
        leftSlot: <Icon icon={value === v ? 'check' : 'empty'} />,
      })),
    [value, items],
  );

  return <Dropdown items={dropdownItems}>{children}</Dropdown>;
}
