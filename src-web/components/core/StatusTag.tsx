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
  const category = `${status}`[0];
  return (
    <span
      className={classNames(
        className,
        'font-mono',
        category === '0' && 'text-fg-danger',
        category === '1' && 'text-fg-info',
        category === '2' && 'text-fg-success',
        category === '3' && 'text-fg-primary',
        category === '4' && 'text-fg-warning',
        category === '5' && 'text-fg-danger',
      )}
    >
      {label} {showReason && response.statusReason && response.statusReason}
    </span>
  );
}
