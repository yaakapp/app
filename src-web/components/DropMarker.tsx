import classNames from 'classnames';
import React, { memo } from 'react';

interface Props {
  className?: string;
  depth: number;
}

export const DropMarker = memo(
  function DropMarker({ className, depth }: Props) {
    return (
      <div
        className={classNames(
          className,
          depth > 0 ? 'ml-5' : 'ml-0',
          'relative w-full h-0 overflow-visible pointer-events-none',
        )}
      >
        <div className="absolute z-50 left-2 right-2 -bottom-[0.1rem] h-[0.2rem] bg-blue-500/50 rounded-full" />
      </div>
    );
  },
  () => true,
);
