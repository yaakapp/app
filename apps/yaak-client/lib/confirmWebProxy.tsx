import { platform } from "@yaakapp-internal/platform";
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
          Requests from the web app go through the Yaak proxy. The proxy can read your request and
          response, including headers, credentials, body content, and the selected cookie jar.
        </p>
        <p className="break-all">
          Proxy: <strong>{proxyUrl}</strong>
        </p>
        <p>
          <a
            className="underline hover:no-underline"
            href="https://yaak.app/docs/getting-started/web-proxy"
            target="_blank"
            rel="noopener noreferrer"
          >
            How the proxy works and protects your data
          </a>
        </p>
        <p>We’ll remember your choice in this browser after you continue.</p>
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
