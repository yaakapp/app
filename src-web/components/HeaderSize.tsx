import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { useIsFullscreen } from '../hooks/useIsFullscreen';
import { useOsInfo } from '../hooks/useOsInfo';
import { useSettings } from '../hooks/useSettings';

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
  const settings = useSettings();
  const platform = useOsInfo();
  const fullscreen = useIsFullscreen();
  const stoplightsVisible = platform?.osType === 'macos' && !fullscreen && !ignoreStoplights;
  return (
    <div
      data-tauri-drag-region
      onDoubleClick={async () => {
        // Maximize window on double-click
        await getCurrentWebviewWindow().toggleMaximize();
      }}
      style={{
        ...style,
        // Add padding for macOS stoplights, but keep it the same width (account for the interface scale)
        paddingLeft: stoplightsVisible ? 72 / settings.interfaceScale : undefined,
      }}
      className={classNames(
        className,
        'select-none',
        'pt-[1px] w-full border-b border-border-subtle min-w-0',
        stoplightsVisible ? 'pr-1' : 'pl-1',
        size === 'md' && 'h-[27px]',
        size === 'lg' && 'h-[38px]',
      )}
    >
      {/* NOTE: This needs display:grid or else the element shrinks (even though scrollable) */}
      <div className="h-full w-full overflow-x-auto hide-scrollbars grid" {...props} />
    </div>
  );
}
