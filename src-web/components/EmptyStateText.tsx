import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function EmptyStateText({ children, className }: Props) {
  return (
    <div
      className={classNames(
        className,
        'rounded-lg border border-dashed border-highlight h-full py-2 text-fg-subtler flex items-center justify-center',
      )}
    >
      {children}
    </div>
  );
}
