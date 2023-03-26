import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { Sidebar } from './Sidebar';
import { WorkspaceHeader } from './WorkspaceHeader';
import RequestResponse from './RequestResponse';

const side = { gridArea: 'side' };
const head = { gridArea: 'head' };
const body = { gridArea: 'body' };

export default function Workspace() {
  const windowSize = useWindowSize();
  const styles = useMemo<CSSProperties>(
    () => ({
      gridTemplate: `
        ' ${head.gridArea} ${head.gridArea}' auto
        ' ${side.gridArea} ${body.gridArea}' minmax(0,1fr)
        / auto             1fr
      `,
    }),
    [],
  );

  return (
    <div className="grid w-full h-full" style={styles}>
      <SidebarContainer style={side} floating={windowSize.width < 800}>
        <Sidebar />
      </SidebarContainer>
      <HeaderContainer>
        <WorkspaceHeader className="pointer-events-none" />
      </HeaderContainer>
      <BodyContainer>
        <RequestResponse />
      </BodyContainer>
    </div>
  );
}

const BodyContainer = memo(function BodyContainer({ children }: { children: ReactNode }) {
  return <div style={body}>{children}</div>;
});

const HeaderContainer = memo(function HeaderContainer({ children }: { children: ReactNode }) {
  return (
    <div
      data-tauri-drag-region
      className="h-md px-3 w-full pl-20 bg-gray-50 border-b border-b-highlight text-gray-900 pt-[1px]"
      style={head}
    >
      {children}
    </div>
  );
});

interface SidebarContainerProps {
  children: ReactNode;
  style: CSSProperties;
  floating?: boolean;
}

const SidebarContainer = memo(function SidebarContainer({
  children,
  style,
  floating,
}: SidebarContainerProps) {
  const sidebar = useSidebarDisplay();
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (sidebar.width === undefined) return;

      unsub();
      const mouseStartX = e.clientX;
      const startWidth = sidebar.width;
      moveState.current = {
        move: (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          sidebar.set(startWidth + (e.clientX - mouseStartX));
        },
        up: (e: MouseEvent) => {
          e.preventDefault();
          unsub();
          setIsResizing(false);
        },
      };
      document.documentElement.addEventListener('mousemove', moveState.current.move);
      document.documentElement.addEventListener('mouseup', moveState.current.up);
      setIsResizing(true);
    },
    [sidebar.width],
  );

  const sidebarStyles = useMemo(
    () => ({
      width: sidebar.hidden ? 0 : sidebar.width, // No width when hidden
      borderWidth: sidebar.hidden ? 0 : undefined, // No border when hidden
    }),
    [sidebar.width, sidebar.hidden, style],
  );

  const commonClassname = classnames('overflow-hidden bg-gray-100 border-highlight');

  if (floating) {
    return (
      <div style={style}>
        <div
          style={sidebarStyles}
          className={classnames(
            commonClassname,
            'fixed top-11 z-20 left-1 bottom-1 border rounded-md shadow-lg',
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={classnames(commonClassname, 'relative h-full border-r')} style={sidebarStyles}>
      <ResizeBar
        justify="end"
        side="right"
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        onReset={sidebar.reset}
      />
      {children}
    </div>
  );
});

interface ResizeBarProps {
  className?: string;
  barClassName?: string;
  isResizing: boolean;
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onReset?: () => void;
  side: 'left' | 'right' | 'top';
  justify: 'center' | 'end' | 'start';
}

export function ResizeBar({
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
      className={classnames(
        className,
        'group absolute z-10 flex cursor-ew-resize',
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
            'fixed inset-0 cursor-ew-resize',
            vertical && 'cursor-ns-resize',
            !vertical && 'cursor-ew-resize',
          )}
        />
      )}
    </div>
  );
}
