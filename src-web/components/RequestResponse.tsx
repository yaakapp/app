import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useKeyValue } from '../hooks/useKeyValue';
import { clamp } from '../lib/clamp';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';
import { ResizeBar } from './Workspace';

interface Props {
  style: CSSProperties;
  vertical?: boolean;
}

const rqst = { gridArea: 'rqst' };
const resp = { gridArea: 'resp' };
const drag = { gridArea: 'drag' };

const DEFAULT = 0.5;
const MIN_WIDTH_PX = 10;
const MIN_HEIGHT_PX = 100;

export default function RequestResponse({ style, vertical }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widthKv = useKeyValue<number>({ key: 'body_width', defaultValue: DEFAULT });
  const heightKv = useKeyValue<number>({ key: 'body_height', defaultValue: DEFAULT });
  const width = widthKv.value ?? DEFAULT;
  const height = heightKv.value ?? DEFAULT;
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  const styles = useMemo<CSSProperties>(
    () => ({
      ...style,
      gridTemplate: vertical
        ? `
          ' ${rqst.gridArea}' minmax(0,${1 - height}fr)
          ' ${drag.gridArea}' auto
          ' ${resp.gridArea}' minmax(0,${height}fr)
          / 1fr            
        `
        : `
          ' ${rqst.gridArea} ${drag.gridArea} ${resp.gridArea}' minmax(0,1fr)
          / ${1 - width}fr   auto             ${width}fr           
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
    <div ref={containerRef} className="grid w-full h-full p-3" style={styles}>
      <div style={rqst}>
        <RequestPane fullHeight={!vertical} />
      </div>
      <div style={drag} className={classnames('relative flex-grow-0', vertical ? 'h-3' : 'w-3')}>
        <ResizeBar
          isResizing={isResizing}
          onResizeStart={handleResizeStart}
          onReset={handleReset}
          side={vertical ? 'top' : 'left'}
          justify="center"
        />
      </div>
      <div style={resp}>
        <ResponsePane />
      </div>
    </div>
  );
}
