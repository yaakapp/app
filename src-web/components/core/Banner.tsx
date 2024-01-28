import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  color?: 'danger' | 'success' | 'gray';
}
export function Banner({ children, className, color = 'gray' }: Props) {
  return (
    <div>
      <div
        className={classNames(
          className,
          'border border-dashed italic px-3 py-2 rounded select-auto cursor-text',
          color === 'gray' && 'border-gray-500/60 bg-gray-300/10 text-gray-800',
          color === 'danger' && 'border-red-500/60 bg-red-300/10 text-red-800',
          color === 'success' && 'border-green-500/60 bg-green-300/10 text-green-800',
        )}
      >
        {children}
      </div>
    </div>
  );
}
