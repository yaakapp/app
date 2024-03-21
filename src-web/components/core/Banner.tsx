import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  color?: 'danger' | 'warning' | 'success' | 'gray';
}
export function Banner({ children, className, color = 'gray' }: Props) {
  return (
    <div>
      <div
        className={classNames(
          className,
          'border border-dashed italic px-3 py-2 rounded select-auto cursor-text',
          color === 'gray' && 'border-gray-500/60 bg-gray-300/10 text-gray-800',
          color === 'warning' && 'border-orange-500/60 bg-orange-300/10 text-orange-800',
          color === 'danger' && 'border-red-500/60 bg-red-300/10 text-red-800',
          color === 'success' && 'border-violet-500/60 bg-violet-300/10 text-violet-800',
        )}
      >
        {children}
      </div>
    </div>
  );
}
