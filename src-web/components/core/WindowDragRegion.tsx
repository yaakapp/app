import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
}

export function WindowDragRegion({ className, ...props }: Props) {
  return (
    <div
      data-tauri-drag-region
      className={classnames(className, 'w-full h-12 flex-shrink-0')}
      {...props}
    />
  );
}
