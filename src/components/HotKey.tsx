import { HTMLAttributes } from 'react';
import classnames from 'classnames';

export function HotKey({ children }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={classnames(
        'bg-gray-400 bg-opacity-20 px-1.5 py-0.5 rounded text-sm',
        'font-mono text-gray-500 tracking-widest',
      )}
    >
      {children}
    </span>
  );
}
