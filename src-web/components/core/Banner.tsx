import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function Banner({ children, className, color = 'secondary' }: Props) {
  return (
    <div>
      <div
        className={classNames(
          className,
          `x-theme-banner--${color}`,
          'border border-dashed italic px-3 py-2 rounded select-auto cursor-text',
          'border-background-highlight bg-background-highlight-secondary text-fg',
        )}
      >
        {children}
      </div>
    </div>
  );
}
