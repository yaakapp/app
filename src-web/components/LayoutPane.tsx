import classnames from 'classnames';
import type { ReactNode } from 'react';

export interface LayoutPaneProps {
  children?: ReactNode;
  className?: string;
}

export function LayoutPane({ className, children }: LayoutPaneProps) {
  return (
    <div className={classnames(className, 'w-full h-full p-2')} data-tauri-drag-region>
      <div className={classnames('w-full h-full bg-gray-50/50 rounded-lg')}>{children}</div>
    </div>
  );
}
