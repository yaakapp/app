import classnames from 'classnames';
import {HTMLAttributes} from 'react';

const colsClasses = {
  none: 'grid-cols-none',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

const rowsClasses = {
  none: 'grid-rows-none',
  1: 'grid-rows-1',
  2: 'grid-rows-2',
};

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
};

type Props = HTMLAttributes<HTMLElement> & {
  rows?: keyof typeof rowsClasses;
  cols?: keyof typeof colsClasses;
  gap?: keyof typeof gapClasses;
};

export function Grid({ className, cols, gap, ...props }: Props) {
  return (
    <div
      className={classnames(className, 'grid', cols && colsClasses[cols], gap && gapClasses[gap])}
      {...props}
    />
  );
}
