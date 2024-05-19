import { useDeleteHttpResponse } from '../hooks/useDeleteHttpResponse';
import { useDeleteHttpResponses } from '../hooks/useDeleteHttpResponses';
import type { HttpResponse } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';

interface Props {
  responses: HttpResponse[];
  activeResponse: HttpResponse;
  onPinnedResponse: (r: HttpResponse) => void;
}

export const RecentResponsesDropdown = function ResponsePane({
  activeResponse,
  responses,
  onPinnedResponse,
}: Props) {
  const deleteResponse = useDeleteHttpResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteHttpResponses(activeResponse?.requestId);

  return (
    <Dropdown
      items={[
        {
          key: 'clear-single',
          label: 'Clear Response',
          onSelect: deleteResponse.mutate,
          disabled: responses.length === 0,
        },
        {
          key: 'clear-all',
          label: `Clear ${responses.length} ${pluralize('Response', responses.length)}`,
          onSelect: deleteAllResponses.mutate,
          hidden: responses.length <= 1,
          disabled: responses.length === 0,
        },
        { type: 'separator', label: 'History' },
        ...responses.slice(0, 20).map((r) => ({
          key: r.id,
          label: (
            <HStack space={2} alignItems="center">
              <StatusTag className="text-xs" response={r} />
              <span>&rarr;</span>{' '}
              <span className="font-mono text-xs">{r.elapsed >= 0 ? `${r.elapsed}ms` : 'n/a'}</span>
            </HStack>
          ),
          leftSlot: activeResponse?.id === r.id ? <Icon icon="check" /> : <Icon icon="empty" />,
          onSelect: () => onPinnedResponse(r),
        })),
      ]}
    >
      <IconButton
        title="Show response history"
        icon="chevronDown"
        className="ml-auto"
        size="sm"
        iconSize="md"
      />
    </Dropdown>
  );
};
