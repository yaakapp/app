import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function FormattedError({ children }: Props) {
  return (
    <pre
      className={classNames(
        'w-full text-sm select-auto cursor-text bg-gray-100 p-3 rounded',
        'whitespace-pre-wrap border border-red-500 border-dashed overflow-x-auto',
      )}
    >
      {children}
    </pre>
  );
}
