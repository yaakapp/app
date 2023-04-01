import { useMemo } from 'react';

interface Props {
  body: string;
  contentType: string;
  url: string;
}

export function Webview({ body, url, contentType }: Props) {
  const contentForIframe: string | undefined = useMemo(() => {
    if (!contentType.includes('html')) return;
    if (body.includes('<head>')) {
      return body.replace(/<head>/gi, `<head><base href="${url}"/>`);
    }
    return body;
  }, [url, body, contentType]);

  return (
    <div className="px-2 pb-2">
      <iframe
        title="Response preview"
        srcDoc={contentForIframe}
        sandbox="allow-scripts allow-same-origin"
        className="h-full w-full rounded-md border border-gray-100/20"
      />
    </div>
  );
}
