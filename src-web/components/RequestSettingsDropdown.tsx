import type { HTMLAttributes, ReactElement } from 'react';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';

interface Props {
  requestId: string;
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
}

export function RequestSettingsDropdown({ requestId, children }: Props) {
  const deleteRequest = useDeleteRequest(requestId ?? null);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });

  return (
    <Dropdown
      items={[
        {
          label: 'Duplicate',
          onSelect: duplicateRequest.mutate,
          leftSlot: <Icon icon="copy" />,
        },
        {
          label: 'Delete',
          onSelect: deleteRequest.mutate,
          leftSlot: <Icon icon="trash" />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
