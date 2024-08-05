import { useSaveResponse } from '../../hooks/useSaveResponse';
import type { HttpResponse } from '@yaakapp/api';
import { getContentTypeHeader } from '../../lib/models';
import { Banner } from '../core/Banner';
import { Button } from '../core/Button';
import { InlineCode } from '../core/InlineCode';

interface Props {
  response: HttpResponse;
}

export function BinaryViewer({ response }: Props) {
  const saveResponse = useSaveResponse(response);
  const contentType = getContentTypeHeader(response.headers) ?? 'unknown';
  return (
    <Banner color="primary" className="h-full flex flex-col gap-3">
      <p>
        Content type <InlineCode>{contentType}</InlineCode> cannot be previewed
      </p>
      <div>
        <Button variant="border" size="sm" onClick={() => saveResponse.mutate()}>
          Save to File
        </Button>
      </div>
    </Banner>
  );
}
