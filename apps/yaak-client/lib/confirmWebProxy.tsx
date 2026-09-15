import { platform } from "@yaakapp-internal/platform";
import { Icon, InlineCode } from "@yaakapp-internal/ui";
import { Tooltip } from "../components/core/Tooltip";
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
          The proxy has access to your request, response, and credentials, but doesn’t store request
          or response bodies.
        </p>
        <div className="flex items-center gap-2">
          <InlineCode className="min-w-0 break-all">{proxyUrl}</InlineCode>
          <Tooltip
            content={
              <div className="space-y-2">
                <p className="font-semibold">How the proxy works</p>
                <p>
                  Requests are processed in memory. Server logs include URLs, client IP addresses,
                  and timing. Open the guide for details.
                </p>
              </div>
            }
          >
            <a
              className="inline-flex text-text-subtle hover:text-text"
              aria-label="How the proxy works"
              href="https://yaak.app/docs/getting-started/web-proxy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="info" size="sm" />
            </a>
          </Tooltip>
        </div>
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
