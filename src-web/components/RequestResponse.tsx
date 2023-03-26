import classnames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useKeyValue } from '../hooks/useKeyValue';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';
import { ResizeBar } from './Workspace';

const rqst = { gridArea: 'rqst' };
const resp = { gridArea: 'resp' };
const drag = { gridArea: 'drag' };

export default function RequestResponse() {
  const DEFAULT = 0.5;
  const containerRef = useRef<HTMLDivElement>(null);
  const widthKv = useKeyValue<number>({ key: 'body_width', defaultValue: DEFAULT });
  const heightKv = useKeyValue<number>({ key: 'body_height', defaultValue: DEFAULT });
  const width = widthKv.value ?? DEFAULT;
  const height = heightKv.value ?? DEFAULT;
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  const vertical = false;
  const styles = useMemo<CSSProperties>(
    () => ({
      gridTemplate: vertical
        ? `
          ' ${rqst.gridArea}' ${1 - height}fr
          ' ${drag.gridArea}' auto
          ' ${resp.gridArea}' ${height}fr
          / 1fr            
        `
        : `
          ' ${rqst.gridArea} ${drag.gridArea} ${resp.gridArea}' minmax(0,1fr)
          / ${1 - width}fr   auto             ${width}fr           
        `,
    }),
    [vertical, width, height],
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
            const newHeightPx = startHeight - (e.clientY - mouseStartY);
            const newHeight = newHeightPx / containerRect.height;
            heightKv.set(newHeight);
          } else {
            const newWidthPx = startWidth - (e.clientX - mouseStartX);
            const newWidth = newWidthPx / containerRect.width;
            widthKv.set(newWidth);
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
        <RequestPane fullHeight />
      </div>
      <div style={drag} className={classnames('relative', vertical ? 'h-3' : 'w-3')}>
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
