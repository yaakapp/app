import classnames from 'classnames';
import type { ComponentChildren } from 'preact';

interface Props {
  className?: string;
  children?: ComponentChildren;
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
