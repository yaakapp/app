import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import React from 'react';

interface ResizeBarProps {
  style?: CSSProperties;
  className?: string;
  barClassName?: string;
  isResizing: boolean;
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onReset?: () => void;
  side: 'left' | 'right' | 'top';
  justify: 'center' | 'end' | 'start';
}

export function ResizeHandle({
  style,
  justify,
  className,
  onResizeStart,
  onReset,
  isResizing,
  side,
}: ResizeBarProps) {
  const vertical = side === 'top';
  return (
    <div
      aria-hidden
      draggable
      style={style}
      className={classnames(
        className,
        'group z-10 flex cursor-ew-resize',
        vertical ? 'w-full h-3 cursor-ns-resize' : 'h-full w-3 cursor-ew-resize',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'start' && 'justify-start',
        side === 'right' && 'right-0',
        side === 'left' && 'left-0',
        side === 'top' && 'top-0',
      )}
      onDragStart={onResizeStart}
      onDoubleClick={onReset}
    >
      {/* Show global overlay with cursor style to ensure cursor remains the same when moving quickly */}
      {isResizing && (
        <div
          className={classnames(
            'fixed -left-20 -right-20 -top-20 -bottom-20 cursor-ew-resize',
            vertical && 'cursor-ns-resize',
            !vertical && 'cursor-ew-resize',
          )}
        />
      )}
    </div>
  );
}
