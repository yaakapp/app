import { shell } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { IconButton } from './core/IconButton';
import { KeyValueRow, KeyValueRows } from './core/KeyValueRow';
import { Separator } from './core/Separator';

interface Props {
  response: HttpResponse;
}

export function ResponseHeaders({ response }: Props) {
  return (
    <div className="overflow-auto h-full pb-4">
      <KeyValueRows>
        {response.headers.map((h, i) => (
          <KeyValueRow key={i} label={h.name} value={h.value} labelClassName="!text-violet-600" />
        ))}
      </KeyValueRows>
      <Separator className="my-4">Other Info</Separator>
      <KeyValueRows>
        <KeyValueRow label="Version" value={response.version} />
        <KeyValueRow label="Remote Address" value={response.remoteAddr} />
        <KeyValueRow
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
      </KeyValueRows>
    </div>
  );
}
