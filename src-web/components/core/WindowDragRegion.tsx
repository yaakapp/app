import classNames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
}

export function WindowDragRegion({ className, ...props }: Props) {
  return (
    <div
      data-tauri-drag-region
      className={classNames(className, 'w-full flex-shrink-0')}
      {...props}
    />
  );
}
