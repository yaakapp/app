import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { RequestResponse } from './RequestResponse';
import { ResizeHandle } from './ResizeHandle';
import { Sidebar } from './Sidebar';
import { WorkspaceHeader } from './WorkspaceHeader';

const side = { gridArea: 'side' };
const head = { gridArea: 'head' };
const body = { gridArea: 'body' };
const drag = { gridArea: 'drag' };

export default function Workspace() {
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
        move: async (e: MouseEvent) => {
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
    [sidebar.width, sidebar.hidden],
  );

  const sideWidth = sidebar.hidden ? 0 : sidebar.width;
  const styles = useMemo<CSSProperties>(
    () => ({
      gridTemplate: `
        ' ${head.gridArea} ${head.gridArea} ${head.gridArea}' auto
        ' ${side.gridArea} ${drag.gridArea} ${body.gridArea}' minmax(0,1fr)
        / ${sideWidth}px   0                1fr`,
    }),
    [sideWidth],
  );

  return (
    <div
      className={classnames(
        'grid w-full h-full',
        // Animate sidebar width changes but only when not resizing
        // because it's too slow to animate on mouse move
        !isResizing && 'transition-all',
      )}
      style={styles}
    >
      <div
        data-tauri-drag-region
        className="h-md px-3 w-full pl-20 bg-gray-50 border-b border-b-highlight text-gray-900 pt-[1px]"
        style={head}
      >
        <WorkspaceHeader className="pointer-events-none" />
      </div>
      <div
        style={side}
        className={classnames('overflow-hidden bg-gray-100 border-r border-highlight')}
      >
        <Sidebar />
      </div>
      <ResizeHandle
        className="-translate-x-3"
        justify="end"
        side="right"
        isResizing={isResizing}
        onResizeStart={handleResizeStart}
        onReset={sidebar.reset}
      />
      <RequestResponse style={body} />
    </div>
  );
}
