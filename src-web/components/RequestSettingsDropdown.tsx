import { memo } from 'react';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';

export const RequestSettingsDropdown = memo(function RequestSettingsDropdown() {
  const activeRequestId = useActiveRequestId();
  const deleteRequest = useDeleteRequest(activeRequestId ?? null);
  return (
    <Dropdown
      items={[
        {
          label: 'Something Else',
          onSelect: () => null,
          leftSlot: <Icon icon="camera" />,
        },
        '-----',
        {
          label: 'Delete Request',
          onSelect: deleteRequest.mutate,
          leftSlot: <Icon icon="trash" />,
        },
      ]}
    >
      <IconButton size="sm" title="Request Options" icon="gear" />
    </Dropdown>
  );
});
