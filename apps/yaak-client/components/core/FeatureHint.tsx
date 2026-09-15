import { platform } from "@yaakapp-internal/platform";
import { Icon } from "@yaakapp-internal/ui";
import type { ReactNode } from "react";
import { setKeyValue } from "../../lib/keyValueStore";
import { DismissibleBanner } from "./DismissibleBanner";

interface Props {
  /** Stable id; the dismissal is remembered under it. */
  id: string;
  children: ReactNode;
  docsUrl?: string;
  action?: { label: string; onClick: () => void | Promise<void> };
  onDismiss?: () => void;
  className?: string;
}

/**
 * A one-time nudge toward a feature the user hasn't found yet. Dismissed once, gone for good.
 */
export function FeatureHint({ id, children, docsUrl, action, onDismiss, className }: Props) {
  const actions = [
    ...(action ? [{ ...action, variant: "solid" as const, color: "info" as const }] : []),
    ...(action != null && docsUrl != null
      ? [
          {
            label: "Docs",
            rightSlot: <Icon icon="external_link" size="xs" className="opacity-60" />,
            onClick: () => platform.openUrl(docsUrl).catch(console.error),
          },
        ]
      : []),
  ];
  return (
    <DismissibleBanner
      id={`feature-hint:${id}`}
      variant="tip"
      color="info"
      size="xs"
      onDismiss={onDismiss}
      className={className}
      actions={actions}
    >
      <div className="flex items-start gap-2 text-xs">
        <Icon icon="sparkles" size="xs" className="hidden @[16rem]:block mt-0.5 shrink-0" />
        <div className="min-w-0">
          {children}
          {action == null && docsUrl != null && (
            <>
              {" "}
              (
              <button
                type="button"
                className="group inline-flex items-center gap-0.5 underline hover:text-info cursor-pointer! [&_*]:cursor-pointer!"
                onClick={() => platform.openUrl(docsUrl).catch(console.error)}
              >
                docs
                <Icon
                  icon="external_link"
                  size="xs"
                  className="opacity-80 group-hover:opacity-100"
                />
              </button>
              )
            </>
          )}
        </div>
      </div>
    </DismissibleBanner>
  );
}

export function dismissFeatureHint(id: string) {
  return setKeyValue({
    namespace: "global",
    key: ["dismiss-banner", `feature-hint:${id}`],
    value: true,
  });
}
