import useResizeObserver from '@react-hook/resize-observer';
import classNames from 'classnames';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { useActiveRequestId } from '../../hooks/useActiveRequestId';
import { useActiveWorkspaceId } from '../../hooks/useActiveWorkspaceId';
import { clamp } from '../../lib/clamp';
import { ResizeHandle } from '../ResizeHandle';
import { HotKeyList } from './HotKeyList';

interface SlotProps {
  orientation: 'horizontal' | 'vertical';
  style: CSSProperties;
}

interface Props {
  style: CSSProperties;
  leftSlot: (props: SlotProps) => ReactNode;
  rightSlot: (props: SlotProps) => ReactNode;
}

const areaL = { gridArea: 'left' };
const areaR = { gridArea: 'right' };
const areaD = { gridArea: 'drag' };

const DEFAULT = 0.5;
const MIN_WIDTH_PX = 10;
const MIN_HEIGHT_PX = 30;
const STACK_VERTICAL_WIDTH = 700;

export function SplitLayout({ style, leftSlot, rightSlot }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<boolean>(false);
  const [widthRaw, setWidth] = useLocalStorage<number>(`body_width::${useActiveWorkspaceId()}`);
  const [heightRaw, setHeight] = useLocalStorage<number>(`body_height::${useActiveWorkspaceId()}`);
  const width = widthRaw ?? DEFAULT;
  const height = heightRaw ?? DEFAULT;
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  useResizeObserver(containerRef.current, ({ contentRect }) => {
    setVertical(contentRect.width < STACK_VERTICAL_WIDTH);
  });

  const styles = useMemo<CSSProperties>(
    () => ({
      ...style,
      gridTemplate: vertical
        ? `
          ' ${areaL.gridArea}' minmax(0,${1 - height}fr)
          ' ${areaD.gridArea}' 0
          ' ${areaR.gridArea}' minmax(0,${height}fr)
          / 1fr            
        `
        : `
          ' ${areaL.gridArea} ${areaD.gridArea} ${areaR.gridArea}' minmax(0,1fr)
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
    () => (vertical ? setHeight(DEFAULT) : setWidth(DEFAULT)),
    [setHeight, vertical, setWidth],
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
            setHeight(newHeightPx / containerRect.height);
          } else {
            const maxWidthPx = containerRect.width - MIN_WIDTH_PX;
            const newWidthPx = clamp(
              startWidth - (e.clientX - mouseStartX),
              MIN_WIDTH_PX,
              maxWidthPx,
            );
            setWidth(newWidthPx / containerRect.width);
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
    [width, height, vertical, setHeight, setWidth],
  );

  const activeRequestId = useActiveRequestId();
  if (activeRequestId === null) {
    return <HotKeyList hotkeys={['request.create', 'sidebar.toggle']} />;
  }

  return (
    <div ref={containerRef} className="grid gap-1.5 w-full h-full p-3" style={styles}>
      {leftSlot({ style: areaL, orientation: vertical ? 'vertical' : 'horizontal' })}
      <ResizeHandle
        style={areaD}
        isResizing={isResizing}
        className={classNames(vertical ? 'translate-y-0.5' : 'translate-x-0.5')}
        onResizeStart={handleResizeStart}
        onReset={handleReset}
        side={vertical ? 'top' : 'left'}
        justify="center"
      />
      {rightSlot({ style: areaR, orientation: vertical ? 'vertical' : 'horizontal' })}
    </div>
  );
}
