import classNames from 'classnames';
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
  onPinnedResponseId: (id: string) => void;
  className?: string;
}

export const RecentResponsesDropdown = function ResponsePane({
  activeResponse,
  responses,
  onPinnedResponseId,
  className,
}: Props) {
  const deleteResponse = useDeleteHttpResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteHttpResponses(activeResponse?.requestId);
  const latestResponseId = responses[0]?.id ?? 'n/a';

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
        ...responses.slice(0, 20).map((r: HttpResponse) => ({
          key: r.id,
          label: (
            <HStack space={2}>
              <StatusTag className="text-sm" response={r} />
              <span>&rarr;</span>{' '}
              <span className="font-mono text-sm">{r.elapsed >= 0 ? `${r.elapsed}ms` : 'n/a'}</span>
            </HStack>
          ),
          leftSlot: activeResponse?.id === r.id ? <Icon icon="check" /> : <Icon icon="empty" />,
          onSelect: () => onPinnedResponseId(r.id),
        })),
      ]}
    >
      <IconButton
        title="Show response history"
        icon={activeResponse?.id === latestResponseId ? 'chevronDown' : 'pin'}
        className={classNames(className, 'm-0.5')}
        size="sm"
        iconSize="md"
      />
    </Dropdown>
  );
};
