import { useCreateDropdownItems } from '../hooks/useCreateDropdownItems';
import type { DropdownProps } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

interface Props extends Omit<DropdownProps, 'items'> {
  hideFolder?: boolean;
}

export function CreateDropdown({ hideFolder, children, ...props }: Props) {
  const items = useCreateDropdownItems({ hideFolder, hideIcons: true });
  return (
    <Dropdown items={items} {...props}>
      {children}
    </Dropdown>
  );
}
