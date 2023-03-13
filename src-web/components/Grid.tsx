import classnames from 'classnames';
import type { ReactNode } from 'react';

const colsClasses: Record<string | number, string> = {
  none: 'grid-cols-none',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  11: 'grid-cols-11',
};

const rowsClasses = {
  none: 'grid-rows-none',
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  11: 'grid-rows-11',
};

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
};

interface Props {
  rows?: keyof typeof rowsClasses;
  cols?: keyof typeof colsClasses;
  gap?: keyof typeof gapClasses;
  className?: string;
  children?: ReactNode;
}

export function Grid({ className, cols, gap, children }: Props) {
  return (
    <div
      className={classnames(
        className,
        'grid w-full',
        cols && colsClasses[cols],
        gap && gapClasses[gap],
      )}
    >
      {children}
    </div>
  );
}
