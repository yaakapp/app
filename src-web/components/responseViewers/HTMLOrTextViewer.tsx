import type { HttpResponse } from '@yaakapp-internal/models';
import { useContentTypeFromHeaders } from '../../hooks/useContentTypeFromHeaders';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import { isJSON, languageFromContentType } from '../../lib/contentType';
import { BinaryViewer } from './BinaryViewer';
import { TextViewer } from './TextViewer';
import { WebPageViewer } from './WebPageViewer';

interface Props {
  response: HttpResponse;
  pretty: boolean;
  textViewerClassName?: string;
}

export function HTMLOrTextViewer({ response, pretty, textViewerClassName }: Props) {
  const rawBody = useResponseBodyText(response);
  let language = languageFromContentType(useContentTypeFromHeaders(response.headers));

  // A lot of APIs return JSON with `text/html` content type, so interpret as JSON if so
  if (language === 'html' && isJSON(rawBody.data ?? '')) {
    language = 'json';
  }

  if (rawBody.isLoading) {
    return null;
  }

  if (rawBody.data == null) {
    return <BinaryViewer response={response} />;
  }

  if (language === 'html' && pretty) {
    return <WebPageViewer response={response} />;
  } else {
    return <TextViewer response={response} pretty={pretty} className={textViewerClassName} />;
  }
}
