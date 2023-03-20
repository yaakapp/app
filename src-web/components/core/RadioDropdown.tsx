import { memo, useMemo } from 'react';
import type { DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';

export interface RadioDropdownItem {
  label: string;
  value: string;
}

export interface RadioDropdownProps {
  value: string;
  onChange: (bodyType: string) => void;
  items: RadioDropdownItem[];
  children: DropdownProps['children'];
}

export const RadioDropdown = memo(function RadioDropdown({
  value,
  items,
  onChange,
  children,
}: RadioDropdownProps) {
  const dropdownItems = useMemo(
    () =>
      items.map(({ label, value: v }) => ({
        label,
        onSelect: () => onChange(v),
        leftSlot: <Icon icon={value === v ? 'check' : 'empty'} />,
      })),
    [value, items],
  );

  return <Dropdown items={dropdownItems}>{children}</Dropdown>;
});
