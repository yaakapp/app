import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateDropdownItems } from '../hooks/useCreateDropdownItems';
import type { DropdownProps } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

interface Props extends Omit<DropdownProps, 'items'> {
  hideFolder?: boolean;
}

export function CreateDropdown({ hideFolder, children, ...props }: Props) {
  const activeRequest = useActiveRequest();
  const folderId = activeRequest?.folderId ?? null;
  const items = useCreateDropdownItems({
    hideFolder,
    hideIcons: true,
    folderId,
  });
  return (
    <Dropdown items={items} {...props}>
      {children}
    </Dropdown>
  );
}
