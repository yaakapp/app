import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useKeyValue } from '../hooks/useKeyValue';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { clamp } from '../lib/clamp';
import { RequestPane } from './RequestPane';
import { ResizeHandle } from './ResizeHandle';
import { ResponsePane } from './ResponsePane';

interface Props {
  style: CSSProperties;
}

const rqst = { gridArea: 'rqst' };
const resp = { gridArea: 'resp' };
const drag = { gridArea: 'drag' };

const DEFAULT = 0.5;
const MIN_WIDTH_PX = 10;
const MIN_HEIGHT_PX = 100;
const STACK_VERTICAL_WIDTH = 600;

export const RequestResponse = memo(function RequestResponse({ style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<boolean>(false);
  const widthKv = useKeyValue<number>({ key: 'body_width', defaultValue: DEFAULT });
  const heightKv = useKeyValue<number>({ key: 'body_height', defaultValue: DEFAULT });
  const width = widthKv.value ?? DEFAULT;
  const height = heightKv.value ?? DEFAULT;
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  const windowSize = useWindowSize();
  const sidebar = useSidebarDisplay();
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setVertical(width < STACK_VERTICAL_WIDTH);
  }, [containerRef.current, windowSize, sidebar.width, sidebar.hidden]);

  const styles = useMemo<CSSProperties>(
    () => ({
      ...style,
      gridTemplate: vertical
        ? `
          ' ${rqst.gridArea}' minmax(0,${1 - height}fr)
          ' ${drag.gridArea}' 0
          ' ${resp.gridArea}' minmax(0,${height}fr)
          / 1fr            
        `
        : `
          ' ${rqst.gridArea} ${drag.gridArea} ${resp.gridArea}' minmax(0,1fr)
          / ${1 - width}fr   0                ${width}fr           
        `,
    }),
    [vertical, width, height, style],
  );

  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleReset = useCallback(
    () => (vertical ? heightKv.set(DEFAULT) : widthKv.set(DEFAULT)),
    [vertical],
  );

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (containerRef.current === null) return;
      unsub();

      const containerRect = containerRef.current.getBoundingClientRect();

      const mouseStartX = e.clientX;
      const mouseStartY = e.clientY;
      const startWidth = containerRect.width * width;
      const startHeight = containerRect.height * height;

      moveState.current = {
        move: (e: MouseEvent) => {
          e.preventDefault(); // Prevent text selection and things
          if (vertical) {
            const maxHeightPx = containerRect.height - MIN_HEIGHT_PX;
            const newHeightPx = clamp(
              startHeight - (e.clientY - mouseStartY),
              MIN_HEIGHT_PX,
              maxHeightPx,
            );
            heightKv.set(newHeightPx / containerRect.height);
          } else {
            const maxWidthPx = containerRect.width - MIN_WIDTH_PX;
            const newWidthPx = clamp(
              startWidth - (e.clientX - mouseStartX),
              MIN_WIDTH_PX,
              maxWidthPx,
            );
            widthKv.set(newWidthPx / containerRect.width);
          }
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
    [widthKv.value, heightKv.value, vertical],
  );

  return (
    <div ref={containerRef} className="grid gap-1.5 w-full h-full p-3" style={styles}>
      <RequestPane style={rqst} fullHeight={!vertical} />
      <ResizeHandle
        style={drag}
        isResizing={isResizing}
        className={classnames(vertical ? 'translate-y-0.5' : 'translate-x-0.5')}
        onResizeStart={handleResizeStart}
        onReset={handleReset}
        side={vertical ? 'top' : 'left'}
        justify="center"
      />
      <ResponsePane style={resp} />
    </div>
  );
});
