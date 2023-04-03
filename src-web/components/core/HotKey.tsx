import classnames from 'classnames';
import type { HTMLAttributes } from 'react';

export function HotKey({ children }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={classnames(
        'bg-highlightSecondary bg-opacity-20 px-1.5 py-0.5 rounded text-sm',
        'font-mono text-gray-500 tracking-widest',
      )}
    >
      {children}
    </span>
  );
}
