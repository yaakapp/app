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
  name: string;
  firstSlot: (props: SlotProps) => ReactNode;
  secondSlot: null | ((props: SlotProps) => ReactNode);
  style?: CSSProperties;
  className?: string;
  defaultRatio?: number;
  minHeightPx?: number;
  minWidthPx?: number;
  forceVertical?: boolean;
}

const areaL = { gridArea: 'left' };
const areaR = { gridArea: 'right' };
const areaD = { gridArea: 'drag' };

const STACK_VERTICAL_WIDTH = 700;

export function SplitLayout({
  style,
  firstSlot,
  secondSlot,
  className,
  name,
  forceVertical,
  defaultRatio = 0.5,
  minHeightPx = 10,
  minWidthPx = 10,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<boolean>(false);
  const [widthRaw, setWidth] = useLocalStorage<number>(`${name}_width::${useActiveWorkspaceId()}`);
  const [heightRaw, setHeight] = useLocalStorage<number>(
    `${name}_height::${useActiveWorkspaceId()}`,
  );
  const width = widthRaw ?? defaultRatio;
  let height = heightRaw ?? defaultRatio;
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const moveState = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(
    null,
  );

  if (!secondSlot) {
    height = 0;
    minHeightPx = 0;
  }

  useResizeObserver(containerRef.current, ({ contentRect }) => {
    setVertical(contentRect.width < STACK_VERTICAL_WIDTH);
  });

  const styles = useMemo<CSSProperties>(() => {
    return {
      ...style,
      gridTemplate:
        forceVertical || vertical
          ? `
            ' ${areaL.gridArea}' minmax(0,${1 - height}fr)
            ' ${areaD.gridArea}' 0
            ' ${areaR.gridArea}' minmax(${minHeightPx}px,${height}fr)
            / 1fr            
          `
          : `
            ' ${areaL.gridArea} ${areaD.gridArea} ${areaR.gridArea}' minmax(0,1fr)
            / ${1 - width}fr   0                ${width}fr           
          `,
    };
  }, [style, vertical, height, minHeightPx, width]);

  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleReset = useCallback(
    () => (vertical ? setHeight(defaultRatio) : setWidth(defaultRatio)),
    [vertical, setHeight, defaultRatio, setWidth],
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
            const maxHeightPx = containerRect.height - minHeightPx;
            const newHeightPx = clamp(
              startHeight - (e.clientY - mouseStartY),
              minHeightPx,
              maxHeightPx,
            );
            setHeight(newHeightPx / containerRect.height);
          } else {
            const maxWidthPx = containerRect.width - minWidthPx;
            const newWidthPx = clamp(
              startWidth - (e.clientX - mouseStartX),
              minWidthPx,
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
    [width, height, vertical, minHeightPx, setHeight, minWidthPx, setWidth],
  );

  const activeRequestId = useActiveRequestId();
  if (activeRequestId === null) {
    return <HotKeyList hotkeys={['http_request.create', 'sidebar.toggle']} />;
  }

  return (
    <div ref={containerRef} className={classNames(className, 'grid w-full h-full')} style={styles}>
      {firstSlot({ style: areaL, orientation: vertical ? 'vertical' : 'horizontal' })}
      {secondSlot && (
        <>
          <ResizeHandle
            style={areaD}
            isResizing={isResizing}
            barClassName={'bg-red-300'}
            className={classNames(vertical ? 'translate-y-0.5' : 'translate-x-0.5')}
            onResizeStart={handleResizeStart}
            onReset={handleReset}
            side={vertical ? 'top' : 'left'}
            justify="center"
          />
          {secondSlot({ style: areaR, orientation: vertical ? 'vertical' : 'horizontal' })}
        </>
      )}
    </div>
  );
}
