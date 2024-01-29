import classNames from 'classnames';
import type { HttpResponse } from '../lib/models';
import { Separator } from './core/Separator';
import { HStack } from './core/Stacks';

interface Props {
  response: HttpResponse;
}

export function ResponseHeaders({ response }: Props) {
  return (
    <div className="overflow-auto h-full pb-4">
      <dl className="text-xs w-full font-mono flex flex-col">
        {response.headers.map((h, i) => (
          <Row key={i} label={h.name} value={h.value} labelClassName="!text-violet-600" />
        ))}
      </dl>
      <Separator className="my-4">Other Info</Separator>
      <dl className="text-xs w-full font-mono divide-highlightSecondary">
        <Row label="Version" value={response.version} />
        <Row label="Remote Address" value={response.remoteAddr} />
        <Row label="Status" value={response.status} />
        <Row label="Reason" value={response.statusReason} />
        <Row label="URL" value={response.url} />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  labelClassName,
}: {
  label: string;
  value: string | number;
  labelClassName?: string;
}) {
  return (
    <HStack space={3} className="py-0.5">
      <dd className={classNames(labelClassName, 'w-1/3 text-gray-700 select-text cursor-text')}>
        {label}
      </dd>
      <dt className="w-2/3 select-text cursor-text break-all">{value}</dt>
    </HStack>
  );
}
