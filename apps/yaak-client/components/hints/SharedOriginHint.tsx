import { httpRequestsAtom, patchModel } from "@yaakapp-internal/models";
import { InlineCode } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { useEnvironmentsBreakdown } from "../../hooks/useEnvironmentsBreakdown";
import {
  addVariableToBaseEnvironment,
  isTemplate,
  variableTemplate,
} from "../../lib/addVariableToBaseEnvironment";
import { FeatureHint } from "../core/FeatureHint";

const MIN_SHARED_REQUESTS = 3;
const DOCS_URL = "https://yaak.app/docs/templating/environments-and-variables";

/**
 * Once a few requests spell out the same literal origin, offer to hoist it into a variable and
 * rewrite them all at once.
 */
export function SharedOriginHint() {
  const requests = useAtomValue(httpRequestsAtom);
  const { baseEnvironment } = useEnvironmentsBreakdown();

  const shared = useMemo(() => {
    const byOrigin = new Map<string, typeof requests>();
    for (const r of requests) {
      if (isTemplate(r.url)) continue;
      const origin = literalOrigin(r.url);
      if (origin == null) continue;
      byOrigin.set(origin, [...(byOrigin.get(origin) ?? []), r]);
    }
    let best: { origin: string; requests: typeof requests } | null = null;
    for (const [origin, group] of byOrigin) {
      if (group.length >= MIN_SHARED_REQUESTS && group.length > (best?.requests.length ?? 0)) {
        best = { origin, requests: group };
      }
    }
    return best;
  }, [requests]);

  if (shared == null || baseEnvironment == null) return null;

  const { origin } = shared;
  const count = shared.requests.length;

  return (
    <FeatureHint
      id={`shared-origin:${origin}`}
      className="mt-1"
      docsUrl={DOCS_URL}
      action={{
        label: "Use a Variable",
        onClick: async () => {
          const name = await addVariableToBaseEnvironment(baseEnvironment, "base_url", origin);
          const template = variableTemplate(name);
          await Promise.all(
            shared.requests.map((r) =>
              patchModel(r, { url: template + r.url.slice(origin.length) }),
            ),
          );
        },
      }}
    >
      {count} requests start with <InlineCode>{origin}</InlineCode>. Put it in a variable and switch
      hosts by switching environments.
    </FeatureHint>
  );
}

function literalOrigin(url: string): string | null {
  const m = /^(https?:\/\/[^/?#\s]+)/i.exec(url.trim());
  return m?.[1] ?? null;
}
