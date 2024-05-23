import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { DropdownItem, DropdownItemSeparator, DropdownProps } from './Dropdown';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';

export type RadioDropdownItem<T = string | null> =
  | {
      type?: 'default';
      label: string;
      shortLabel?: string;
      value: T;
      rightSlot?: ReactNode;
    }
  | DropdownItemSeparator;

export interface RadioDropdownProps<T = string | null> {
  value: T;
  onChange: (value: T) => void;
  items: RadioDropdownItem<T>[];
  extraItems?: DropdownProps['items'];
  children: DropdownProps['children'];
}

export function RadioDropdown<T = string | null>({
  value,
  items,
  extraItems,
  onChange,
  children,
}: RadioDropdownProps<T>) {
  const dropdownItems = useMemo(
    () => [
      ...items.map((item) => {
        if (item.type === 'separator') {
          return item;
        } else {
          return {
            key: item.label,
            label: item.label,
            shortLabel: item.shortLabel,
            rightSlot: item.rightSlot,
            onSelect: () => onChange(item.value),
            leftSlot: <Icon icon={value === item.value ? 'check' : 'empty'} />,
          } as DropdownProps['items'][0];
        }
      }),
      ...((extraItems ? [{ type: 'separator' }, ...extraItems] : []) as DropdownItem[]),
    ],
    [items, extraItems, value, onChange],
  );

  return <Dropdown items={dropdownItems}>{children}</Dropdown>;
}
