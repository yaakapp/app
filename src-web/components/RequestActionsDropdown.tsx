import type { HTMLAttributes, ReactElement } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useRequest } from '../hooks/useRequest';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';

interface Props {
  requestId: string;
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
}

export function RequestActionsDropdown({ requestId, children }: Props) {
  const request = useRequest(requestId ?? null);
  const deleteRequest = useDeleteRequest(requestId ?? null);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });
  const confirm = useConfirm();

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
          onSelect: async () => {
            const confirmed = await confirm({
              title: 'Delete Request',
              variant: 'delete',
              description: (
                <>
                  Are you sure you want to delete <InlineCode>{request?.name}</InlineCode>?
                </>
              ),
            });
            if (confirmed) {
              deleteRequest.mutate();
            }
          },
          leftSlot: <Icon icon="trash" />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
