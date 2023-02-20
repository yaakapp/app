import classnames from 'classnames';
import { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export function WindowDragRegion({ className, ...props }: Props) {
  return (
    <div
      className={classnames(className, 'w-full h-11 border-b border-gray-500/10')}
      data-tauri-drag-region=""
      {...props}
    />
  );
}
