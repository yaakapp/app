import classnames from 'classnames';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: Pick<HttpResponse, 'status' | 'error'>;
  className?: string;
  asBackground?: boolean;
}

export function StatusTag({ asBackground, response, className }: Props) {
  const { status, error } = response;
  const label = error ? 'ERR' : status;
  if (asBackground) {
    return (
      <span
        className={classnames(
          className,
          'text-white bg-opacity-90 dark:bg-opacity-50',
          status >= 0 && status < 100 && 'bg-red-600',
          status >= 100 && status < 200 && 'bg-yellow-600',
          status >= 200 && status < 300 && 'bg-green-600',
          status >= 300 && status < 400 && 'bg-pink-600',
          status >= 400 && status < 500 && 'bg-orange-600',
          status >= 500 && 'bg-red-600',
        )}
      >
        {label}
      </span>
    );
  } else {
    return (
      <span
        className={classnames(
          className,
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
}
