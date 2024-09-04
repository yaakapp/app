import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'notice' | 'warning' | 'danger';
}

export function Banner({ children, className, color = 'secondary' }: Props) {
  return (
    <div>
      <div
        className={classNames(
          className,
          `x-theme-banner--${color}`,
          'border border-dashed border-border-subtle bg-surface-highlight',
          'italic px-3 py-2 rounded select-auto cursor-text',
          'overflow-x-auto text-text',
        )}
      >
        {children}
      </div>
    </div>
  );
}
