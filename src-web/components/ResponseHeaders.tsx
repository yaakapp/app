import { invoke, shell } from '@tauri-apps/api';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { HttpResponse } from '../lib/models';
import { IconButton } from './core/IconButton';
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
        <Row
          label={
            <div className="flex items-center">
              URL
              <IconButton
                iconSize="sm"
                className="inline-block w-auto ml-1 !h-auto opacity-50 hover:opacity-100"
                icon="externalLink"
                onClick={() => shell.open(response.url)}
                title="Open in browser"
              />
            </div>
          }
          value={
            <div className="flex">
              <span className="select-text cursor-text">{response.url}</span>
            </div>
          }
        />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  labelClassName,
}: {
  label: ReactNode;
  value: ReactNode;
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
