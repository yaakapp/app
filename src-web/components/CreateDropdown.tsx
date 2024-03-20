import { useCreateDropdownItems } from '../hooks/useCreateDropdownItems';
import type { DropdownProps } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

interface Props {
  hideFolder?: boolean;
  children: DropdownProps['children'];
}

export function CreateDropdown({ hideFolder, children }: Props) {
  const items = useCreateDropdownItems({ hideFolder, hideIcons: true });
  return <Dropdown items={items}>{children}</Dropdown>;
}
