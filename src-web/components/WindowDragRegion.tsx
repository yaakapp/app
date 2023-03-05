import classnames from 'classnames';
import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export function WindowDragRegion({ className, ...props }: Props) {
  return (
    <div
      className={classnames(className, 'w-full h-14 flex-shrink-0')}
      data-tauri-drag-region=""
      {...props}
    />
  );
}
