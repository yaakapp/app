import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useKeyValue } from '../../hooks/useKeyValue';
import { useSidebarDisplay } from '../../hooks/useSidebarDisplay';
import { RequestPane } from '../RequestPane';
import { ResponsePane } from '../ResponsePane';
import { Sidebar } from '../Sidebar';
import { WorkspaceHeader } from '../WorkspaceHeader';

const side = { gridArea: 'side' };
const head = { gridArea: 'head' };
const rqst = { gridArea: 'rqst' };
const resp = { gridArea: 'resp' };

export function WorkspaceLayout() {
  const windowSize = useWindowSize();
  const vertical = windowSize.width < 800;
  const styles = useMemo<CSSProperties>(
    () =>
      vertical
        ? {
            gridTemplate: `
      ' ${head.gridArea} ${head.gridArea}' auto
      ' ${side.gridArea} ${rqst.gridArea}' 1fr
      ' ${side.gridArea} ${resp.gridArea}' 1fr
      / auto             1fr
    `,
          }
        : {
            gridTemplate: `
      ' ${head.gridArea} ${head.gridArea} ${head.gridArea}' auto
      ' ${side.gridArea} ${rqst.gridArea} ${resp.gridArea}' 1fr
      / auto             1fr              auto
    `,
          },
    [vertical],
  );

  return (
    <div className="grid w-full h-full" style={styles}>
      <SidebarContainer style={side} floating={windowSize.width < 800}>
        <Sidebar />
      </SidebarContainer>
      <HeaderContainer>
        <WorkspaceHeader className="pointer-events-none" />
      </HeaderContainer>
      <RequestContainer>
        <RequestPane fullHeight />
      </RequestContainer>
      <ResponseContainer>
        <ResponsePane />
      </ResponseContainer>
    </div>
  );
}

const HeaderContainer = memo(function HeaderContainer({ children }: { children: ReactNode }) {
  return (
    <div
      data-tauri-drag-region
      className="h-9 px-3 w-full pl-20 bg-gray-50 border-b border-b-highlight text-gray-900 pt-[1px]"
      style={head}
    >
      {children}
    </div>
  );
});

const RequestContainer = memo(function RequestContainer({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full" style={rqst}>
      {children}
    </div>
  );
});

const ResponseContainer = memo(function ResponseContainer({ children }: { children: ReactNode }) {
  const displayKv = useKeyValue<number>({ key: 'response_width', defaultValue: 400 });
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

  const handleReset = useCallback(() => displayKv.set(500), []);

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (displayKv.value === undefined) return;

      unsub();
      const mouseStartX = e.clientX;
      const startWidth = displayKv.value;
      moveState.current = {
        move: (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          displayKv.set(startWidth - (e.clientX - mouseStartX));
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
    [displayKv.value],
  );

  const sidebarStyles = useMemo(
    () => ({
      width: displayKv.value, // No width when hidden
    }),
    [displayKv.value],
  );

  return (
    <div className="relative" style={sidebarStyles}>
      <ResizeBar
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        side="left"
        onReset={handleReset}
      />
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
      ...style,
      width: sidebar.hidden ? 0 : sidebar.width, // No width when hidden
      borderWidth: sidebar.hidden ? 0 : undefined, // No border when hidden
    }),
    [sidebar.width, sidebar.hidden, style],
  );

  const commonClassname = classnames('overflow-hidden bg-gray-100 border-highlight');

  if (floating) {
    return (
      <div
        style={sidebarStyles}
        className={classnames(
          commonClassname,
          'fixed top-10 z-10 left-1 bottom-1 border rounded-md',
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={classnames(commonClassname, 'relative h-full border-r')} style={sidebarStyles}>
      <ResizeBar
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
  isResizing: boolean;
  onResizeStart: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onReset?: () => void;
  side: 'left' | 'right';
}

function ResizeBar({ onResizeStart, onReset, isResizing, side }: ResizeBarProps) {
  return (
    <div
      aria-hidden
      draggable
      className={classnames(
        'group absolute z-10 w-3 top-0 bottom-0 flex justify-end cursor-ew-resize',
        side === 'right' ? '-right-0.5' : '-left-0.5',
      )}
      onDragStart={onResizeStart}
      onDoubleClick={onReset}
    >
      {/* Show global overlay with cursor style to ensure cursor remains the same when moving quickly */}
      {isResizing && <div className="fixed inset-0 cursor-ew-resize" />}
      <div // drag-divider
        className={classnames(
          'transition-colors w-1 mr-0.5 group-hover:bg-highlight h-full pointer-events-none',
          isResizing && '!bg-blue-500/70',
        )}
      />
    </div>
  );
}
