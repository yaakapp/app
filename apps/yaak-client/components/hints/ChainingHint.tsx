import type { HttpResponse } from "@yaakapp-internal/models";
import { httpRequestsAtom } from "@yaakapp-internal/models";
import { InlineCode } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { FeatureHint } from "../core/FeatureHint";

const MIN_REQUESTS = 2;
const DOCS_URL = "https://yaak.app/docs/templating/request-chaining-scripting";

interface Props {
  response: HttpResponse;
  mimeType: string | null;
}

/** A successful JSON response, in a workspace with somewhere to send its values. */
export function ChainingHint({ response, mimeType }: Props) {
  const requestCount = useAtomValue(httpRequestsAtom).length;
  const status = response.status ?? 0;
  const isJson = mimeType != null && /json/i.test(mimeType);
  if (response.state !== "closed" || status < 200 || status >= 300) return null;
  if (!isJson || requestCount < MIN_REQUESTS) return null;

  return (
    <FeatureHint id="chaining" className="mx-3 mt-1 shrink-0" docsUrl={DOCS_URL}>
      Need a value from here in another request? Press <InlineCode>Ctrl+Space</InlineCode> in any
      field and pick <InlineCode>response()</InlineCode> to pull it out with a JSONPath
    </FeatureHint>
  );
}
