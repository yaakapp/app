import React, { memo } from 'react';

export const DropMarker = memo(
  function DropMarker() {
    return (
      <div className="relative w-full h-0 overflow-visible pointer-events-none">
        <div className="absolute z-50 left-2 right-2 bottom-[1px] h-[0.2em] bg-blue-500/50 rounded-full" />
      </div>
    );
  },
  () => true,
);
