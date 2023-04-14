import { convertFileSrc } from '@tauri-apps/api/tauri';
import classnames from 'classnames';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: HttpResponse;
  className?: string;
}

export function ImageViewer({ response, className }: Props) {
  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);
  return (
    <img
      src={src}
      alt="Response preview"
      className={classnames(className, 'max-w-full max-h-full')}
    />
  );
}
