import classnames from 'classnames';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: Pick<HttpResponse, 'status' | 'error'>;
  className?: string;
}

export function StatusTag({ response, className }: Props) {
  const { status, error } = response;
  const label = error ? 'ERR' : status;
  return (
    <span
      className={classnames(
        className,
        'font-mono',
        status >= 0 && status < 100 && 'text-red-600',
        status >= 100 && status < 200 && 'text-green-600',
        status >= 200 && status < 300 && 'text-green-600',
        status >= 300 && status < 400 && 'text-pink-600',
        status >= 400 && status < 500 && 'text-orange-600',
        status >= 500 && 'text-red-600',
      )}
    >
      {label}
    </span>
  );
}
