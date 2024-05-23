import { convertFileSrc } from '@tauri-apps/api/core';
import React from 'react';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: HttpResponse;
}

export function VideoViewer({ response }: Props) {
  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video className="w-full" controls src={src}></video>;
}
