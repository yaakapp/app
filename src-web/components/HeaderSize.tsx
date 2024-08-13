import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { useIsFullscreen } from '../hooks/useIsFullscreen';
import { useOsInfo } from '../hooks/useOsInfo';

interface HeaderSizeProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size: 'md' | 'lg';
  ignoreStoplights?: boolean;
}

export function HeaderSize({
  className,
  style,
  size,
  ignoreStoplights,
  ...props
}: HeaderSizeProps) {
  const platform = useOsInfo();
  const fullscreen = useIsFullscreen();
  const stoplightsVisible = platform?.osType === 'macos' && !fullscreen && !ignoreStoplights;
  return (
    <div
      data-tauri-drag-region
      style={style}
      className={classNames(
        className,
        'pt-[1px] w-full border-b border-border-subtle min-w-0',
        stoplightsVisible ? 'pl-20 pr-1' : 'pl-1',
        size === 'md' && 'h-[27px]',
        size === 'lg' && 'h-[38px]',
      )}
    >
      {/* NOTE: This needs display:grid or else the element shrinks (even though scrollable) */}
      <div className="h-full w-full overflow-x-auto hide-scrollbars grid" {...props} />
    </div>
  );
}
