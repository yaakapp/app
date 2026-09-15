import { platform } from "@yaakapp-internal/platform";
import { InlineCode } from "@yaakapp-internal/ui";
import { showConfirm } from "./confirm";

const acceptedProxies = new Set<string>();
const pendingConfirmations = new Map<string, Promise<boolean>>();

/** One decision for all pending sends; only acceptance is remembered. */
export function confirmWebProxy(): Promise<boolean> {
  const proxyUrl = platform.httpProxyUrl;
  if (proxyUrl == null) return Promise.resolve(true);

  const key = `yaak.webProxyConsent.v1:${proxyUrl}`;
  try {
    if (localStorage.getItem(key) === "accepted") return Promise.resolve(true);
  } catch {
    // Storage can be unavailable in private or restricted browsing.
  }
  if (acceptedProxies.has(proxyUrl)) return Promise.resolve(true);

  const pending = pendingConfirmations.get(proxyUrl);
  if (pending != null) return pending;

  const confirmation = showConfirm({
    id: "web-proxy-consent",
    title: "Send through the Yaak proxy?",
    confirmText: "Send via Proxy",
    description: (
      <div className="space-y-3">
        <p>
          The proxy can read your full request and response, including any secrets they contain.
          Request and response bodies aren’t stored.
        </p>
        <p>
          <InlineCode className="break-all">{proxyUrl}</InlineCode>
        </p>
        <p>
          Learn more about{" "}
          <a
            className="underline hover:no-underline"
            href="https://yaak.app/docs/getting-started/web-proxy"
            target="_blank"
            rel="noopener noreferrer"
          >
            how the Yaak proxy protects your data
          </a>
          .
        </p>
      </div>
    ),
  })
    .then((accepted) => {
      if (accepted) {
        acceptedProxies.add(proxyUrl);
        try {
          localStorage.setItem(key, "accepted");
        } catch {
          // Keep acceptance for this tab if it cannot be persisted.
        }
      }
      return accepted;
    })
    .finally(() => pendingConfirmations.delete(proxyUrl));

  pendingConfirmations.set(proxyUrl, confirmation);
  return confirmation;
}
