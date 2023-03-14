import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  statusCode: number;
  children: ReactNode;
}

export function StatusColor({ statusCode, children }: Props) {
  return (
    <span
      className={classnames(
        statusCode >= 100 && statusCode < 200 && 'text-green-600',
        statusCode >= 200 && statusCode < 300 && 'text-green-600',
        statusCode >= 300 && statusCode < 400 && 'text-pink-600',
        statusCode >= 400 && statusCode < 500 && 'text-orange-600',
        statusCode >= 500 && statusCode < 600 && 'text-red-600',
      )}
    >
      {children}
    </span>
  );
}
