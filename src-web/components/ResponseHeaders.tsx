import type { HttpResponse } from '@yaakapp/api';
import { KeyValueRow, KeyValueRows } from './core/KeyValueRow';

interface Props {
  response: HttpResponse;
}

export function ResponseHeaders({ response }: Props) {
  return (
    <div className="overflow-auto h-full pb-4">
      <KeyValueRows>
        {response.headers.map((h, i) => (
          <KeyValueRow labelColor="primary" key={i} label={h.name} value={h.value} />
        ))}
      </KeyValueRows>
    </div>
  );
}
