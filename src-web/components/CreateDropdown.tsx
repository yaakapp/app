import { useCreateDropdownItems } from '../hooks/useCreateDropdownItems';
import type { DropdownProps } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

interface Props {
  hideFolder?: boolean;
  children: DropdownProps['children'];
  openOnHotKeyAction?: DropdownProps['openOnHotKeyAction'];
}

export function CreateDropdown({ hideFolder, children, openOnHotKeyAction }: Props) {
  const items = useCreateDropdownItems({ hideFolder, hideIcons: true });
  return (
    <Dropdown openOnHotKeyAction={openOnHotKeyAction} items={items}>
      {children}
    </Dropdown>
  );
}
