import classNames from 'classnames';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: Pick<HttpResponse, 'status' | 'statusReason' | 'error'>;
  className?: string;
  showReason?: boolean;
}

export function StatusTag({ response, className, showReason }: Props) {
  const { status } = response;
  const label = status < 100 ? 'ERR' : status;
  return (
    <span
      className={classNames(
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
      {label} {showReason && response.statusReason && response.statusReason}
    </span>
  );
}
