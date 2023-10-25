import classNames from 'classnames';
import type { HttpResponse } from '../lib/models';
import { HStack } from './core/Stacks';

interface Props {
  headers: HttpResponse['headers'];
}

export function ResponseHeaders({ headers }: Props) {
  return (
    <dl className="text-xs w-full h-full font-mono overflow-auto">
      {headers.map((h, i) => {
        return (
          <HStack
            space={3}
            key={i}
            className={classNames(i > 0 ? 'border-t border-highlightSecondary py-1' : 'pb-1')}
          >
            <dd className="w-1/3 text-violet-600 select-text cursor-text">{h.name}</dd>
            <dt className="w-2/3 select-text cursor-text break-all">{h.value}</dt>
          </HStack>
        );
      })}
    </dl>
  );
}
