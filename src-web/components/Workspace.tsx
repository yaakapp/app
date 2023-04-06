import classnames from 'classnames';
import { motion } from 'framer-motion';
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import { useTauriEvent } from '../hooks/useTauriEvent';
import { WINDOW_FLOATING_SIDEBAR_WIDTH } from '../lib/constants';
import { Button } from './core/Button';
import { HStack } from './core/Stacks';
import { Overlay } from './Overlay';
import { RequestResponse } from './RequestResponse';
import { ResizeHandle } from './ResizeHandle';
import { Sidebar } from './Sidebar';
import { SidebarActions } from './SidebarActions';
import { WorkspaceHeader } from './WorkspaceHeader';

const side = { gridArea: 'side' };
const head = { gridArea: 'head' };
const body = { gridArea: 'body' };
const drag = { gridArea: 'drag' };

export default function Workspace() {
  const { set: setWidth, value: width, reset: resetWidth } = useSidebarWidth();
  const { show, hide, hidden, toggle } = useSidebarHidden();

  const windowSize = useWindowSize();
  const [floating, setFloating] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  useTauriEvent('toggle_sidebar', toggle);

  // float/un-float sidebar on window resize
  useEffect(() => {
    const shouldHide = windowSize.width <= WINDOW_FLOATING_SIDEBAR_WIDTH;
    if (shouldHide && !hidden) {
      setFloating(true);
      hide();
    } else if (!shouldHide && hidden) {
      setFloating(false);
      show();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize.width]);

  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (width === undefined) return;

      unsub();
      const mouseStartX = e.clientX;
      const startWidth = width;
      moveState.current = {
        move: async (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          setWidth(startWidth + (e.clientX - mouseStartX));
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
    [setWidth, width],
  );

  const sideWidth = hidden ? 0 : width;
  const styles = useMemo<CSSProperties>(
    () => ({
      gridTemplate: floating
        ? `
        ' ${head.gridArea}' auto
        ' ${body.gridArea}' minmax(0,1fr)
        / 1fr`
        : `
        ' ${head.gridArea} ${head.gridArea} ${head.gridArea}' auto
        ' ${side.gridArea} ${drag.gridArea} ${body.gridArea}' minmax(0,1fr)
        / ${sideWidth}px   0                1fr`,
    }),
    [sideWidth, floating],
  );

  if (windowSize.width <= 100) {
    return (
      <div>
        <Button>Send</Button>
      </div>
    );
  }

  return (
    <div
      style={styles}
      className={classnames(
        'grid w-full h-full',
        // Animate sidebar width changes but only when not resizing
        // because it's too slow to animate on mouse move
        !isResizing && 'transition-all',
      )}
    >
      {floating ? (
        <Overlay open={!hidden} portalName="sidebar" onClose={hide}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={classnames(
              'absolute top-0 left-0 bottom-0 bg-gray-100 border-r border-highlight w-[14rem]',
              'grid grid-rows-[auto_1fr]',
            )}
          >
            <HeaderSize className="border-transparent">
              <HStack space={0.5}>
                <SidebarActions />
              </HStack>
            </HeaderSize>
            <Sidebar />
          </motion.div>
        </Overlay>
      ) : (
        <>
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
            onReset={resetWidth}
          />
        </>
      )}
      <HeaderSize
        data-tauri-drag-region
        className="w-full bg-gray-50 border-b border-b-highlight text-gray-900"
        style={head}
      >
        <WorkspaceHeader className="pointer-events-none" />
      </HeaderSize>
      <RequestResponse style={body} />
    </div>
  );
}

interface HeaderSizeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function HeaderSize({ className, ...props }: HeaderSizeProps) {
  return (
    <div
      className={classnames(
        className,
        'h-md pt-[1px] flex items-center w-full pr-3 pl-20 border-b',
      )}
      {...props}
    />
  );
}
