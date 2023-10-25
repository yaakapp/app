import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}
export function Banner({ children, className }: Props) {
  return (
    <div>
      <div
        className={classNames(
          className,
          'border border-red-500 bg-red-300/10 text-red-800 px-3 py-2 rounded select-auto cursor-text',
        )}
      >
        {children}
      </div>
    </div>
  );
}
