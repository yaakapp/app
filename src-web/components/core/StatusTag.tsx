import classNames from 'classnames';
import type { HttpResponse } from '@yaakapp-internal/models';
import { isResponseLoading } from '../../lib/model_util';

interface Props {
  response: HttpResponse;
  className?: string;
  showReason?: boolean;
}

export function StatusTag({ response, className, showReason }: Props) {
  const { status } = response;
  const isLoading = isResponseLoading(response);
  const label = isLoading ? response.state.toUpperCase() : status < 100 ? 'ERR' : status;
  const category = `${status}`[0];
  return (
    <span
      className={classNames(
        className,
        'font-mono',
        !isLoading && category === '0' && 'text-danger',
        !isLoading && category === '1' && 'text-info',
        !isLoading && category === '2' && 'text-success',
        !isLoading && category === '3' && 'text-primary',
        !isLoading && category === '4' && 'text-warning',
        !isLoading && category === '5' && 'text-danger',
        isLoading && 'text-text-subtle',
      )}
    >
      {label} {showReason && response.statusReason && response.statusReason}
    </span>
  );
}
