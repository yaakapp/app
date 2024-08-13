import classNames from 'classnames';
import type { HttpResponse } from '@yaakapp/api';

interface Props {
  response: Pick<HttpResponse, 'status' | 'statusReason' | 'error'>;
  className?: string;
  showReason?: boolean;
}

export function StatusTag({ response, className, showReason }: Props) {
  const { status } = response;
  const label = status < 100 ? 'ERR' : status;
  const category = `${status}`[0];
  return (
    <span
      className={classNames(
        className,
        'font-mono',
        category === '0' && 'text-danger',
        category === '1' && 'text-info',
        category === '2' && 'text-success',
        category === '3' && 'text-primary',
        category === '4' && 'text-warning',
        category === '5' && 'text-danger',
      )}
    >
      {label} {showReason && response.statusReason && response.statusReason}
    </span>
  );
}
