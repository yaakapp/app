import { getCurrent } from '@tauri-apps/api/webviewWindow';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useOsInfo } from '../hooks/useOsInfo';
import { Button } from './core/Button';
import { HStack } from './core/Stacks';

interface Props {
  className?: string;
  onlyX?: boolean;
}

export function WindowControls({ className, onlyX }: Props) {
  const [maximized, setMaximized] = useState<boolean>(false);
  const osInfo = useOsInfo();
  const shouldShow = osInfo?.osType === 'linux' || osInfo?.osType === 'windows';
  if (!shouldShow) {
    return null;
  }

  return (
    <HStack className={classNames(className, 'ml-4 h-full')}>
      {!onlyX && (
        <>
          <Button
            className="!h-full px-4 text-fg-subtle hocus:text-fg hocus:bg-background-highlight-secondary rounded-none"
            color="custom"
            onClick={() => getCurrent().minimize()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fill="currentColor" d="M14 8v1H3V8z" />
            </svg>
          </Button>
          <Button
            className="!h-full px-4 text-fg-subtle hocus:text-fg hocus:bg-background-highlight rounded-none"
            color="custom"
            onClick={async () => {
              const w = getCurrent();
              await w.toggleMaximize();
              setMaximized(await w.isMaximized());
            }}
          >
            {maximized ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <g fill="currentColor">
                  <path d="M3 5v9h9V5zm8 8H4V6h7z" />
                  <path fillRule="evenodd" d="M5 5h1V4h7v7h-1v1h2V3H5z" clipRule="evenodd" />
                </g>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M3 3v10h10V3zm9 9H4V4h8z" />
              </svg>
            )}
          </Button>
        </>
      )}
      <Button
        color="custom"
        className="!h-full px-4 text-fg-subtle rounded-none hocus:bg-fg-danger hocus:text-fg"
        onClick={() => getCurrent().close()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </HStack>
  );
}
