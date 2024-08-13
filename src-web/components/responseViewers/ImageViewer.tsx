import { convertFileSrc } from '@tauri-apps/api/core';
import classNames from 'classnames';
import { useState } from 'react';
import type { HttpResponse } from '@yaakapp/api';

interface Props {
  response: HttpResponse;
  className?: string;
}

export function ImageViewer({ response, className }: Props) {
  const bytes = response.contentLength ?? 0;
  const [show, setShow] = useState(bytes < 3 * 1000 * 1000);

  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);
  if (!show) {
    return (
      <>
        <div className="italic text-text-subtlest">
          Response body is too large to preview.{' '}
          <button className="cursor-pointer underline hover:text" onClick={() => setShow(true)}>
            Show anyway
          </button>
        </div>
      </>
    );
  }

  return (
    <img
      src={src}
      alt="Response preview"
      className={classNames(className, 'max-w-full max-h-full')}
    />
  );
}
