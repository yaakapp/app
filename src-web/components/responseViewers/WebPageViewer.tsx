import { useMemo } from 'react';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import type { HttpResponse } from '../../lib/models';

interface Props {
  response: HttpResponse;
}

export function WebPageViewer({ response }: Props) {
  const { url } = response;
  const body = useResponseBodyText(response) ?? '';

  const contentForIframe: string | undefined = useMemo(() => {
    if (body.includes('<head>')) {
      return body.replace(/<head>/gi, `<head><base href="${url}"/>`);
    }
    return body;
  }, [url, body]);

  return (
    <div className="h-full pb-3">
      <iframe
        key={body ? 'has-body' : 'no-body'}
        title="Response preview"
        srcDoc={contentForIframe}
        sandbox="allow-scripts allow-same-origin"
        className="h-full w-full rounded border border-highlightSecondary"
      />
    </div>
  );
}
