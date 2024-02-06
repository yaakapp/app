import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export function InlineCode({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <code
      className={classNames(
        className,
        'font-mono text-xs bg-highlight border-0 border-gray-200/30',
        'px-1.5 py-0.5 rounded text-gray-800 shadow-inner',
      )}
      {...props}
    />
  );
}
