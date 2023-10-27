import { w } from '@tauri-apps/api/clipboard-79413165';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import { useResponseContentType } from '../../hooks/useResponseContentType';
import { tryFormatJson } from '../../lib/formatters';
import type { HttpResponse } from '../../lib/models';
import { Editor } from '../core/Editor';

interface Props {
  response: HttpResponse;
  pretty: boolean;
}

export function TextViewer({ response, pretty }: Props) {
  const contentType = useResponseContentType(response);
  const rawBody = useResponseBodyText(response) ?? '';
  const body = pretty && contentType?.includes('json') ? tryFormatJson(rawBody) : rawBody;

  return (
    <Editor
      readOnly
      forceUpdateKey={body}
      className="bg-gray-50 dark:!bg-gray-100"
      defaultValue={body}
      contentType={contentType}
    />
  );
}
