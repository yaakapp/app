import { convertFileSrc } from '@tauri-apps/api/tauri';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: HttpResponse;
}

export function ImageViewer({ response }: Props) {
  if (response.bodyPath === null) {
    return <div>Empty response body</div>;
  }

  const src = convertFileSrc(response.bodyPath);
  return <img src={src} alt="Response preview" />;
}
