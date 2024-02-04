import type { CSSProperties } from 'react';
import React from 'react';
import { SplitLayout } from './core/SplitLayout';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';

interface Props {
  style: CSSProperties;
}

export function HttpRequestLayout({ style }: Props) {
  return (
    <SplitLayout
      name="http_layout"
      className="p-3 gap-1.5"
      style={style}
      firstSlot={({ orientation, style }) => (
        <RequestPane style={style} fullHeight={orientation === 'horizontal'} />
      )}
      secondSlot={({ style }) => <ResponsePane style={style} />}
    />
  );
}
