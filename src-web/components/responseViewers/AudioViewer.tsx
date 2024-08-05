import { convertFileSrc } from '@tauri-apps/api/core';
import React from 'react';
import type { HttpResponse } from '@yaakapp/api';

interface Props {
  response: HttpResponse;
}

export function AudioViewer({ response }: Props) {
  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio className="w-full" controls src={src}></audio>;
}
