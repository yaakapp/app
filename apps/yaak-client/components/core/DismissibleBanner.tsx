import type { Color } from "@yaakapp-internal/plugins";
import type { BannerProps } from "@yaakapp-internal/ui";
import { Banner } from "@yaakapp-internal/ui";
import classNames from "classnames";
import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";
import { useKeyValue } from "../../hooks/useKeyValue";
import type { ButtonProps } from "./Button";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

type DismissibleBannerSize = "sm" | "xs";

export function DismissibleBanner({
  children,
  className,
  id,
  size = "sm",
  onDismiss,
  onShow,
  actions,
  variant = "banner",
  ...props
}: BannerProps & {
  id: string;
  size?: DismissibleBannerSize;
  onDismiss?: () => void | Promise<void>;
  onShow?: () => void | Promise<void>;
  /** A tip dismisses with an X in the corner instead of a text button */
  variant?: "banner" | "tip";
  actions?: {
    label: string;
    onClick: () => void;
    color?: Color;
    variant?: ButtonProps["variant"];
    rightSlot?: ReactNode;
  }[];
}) {
  const {
    isLoading,
    set: setDismissed,
    value: dismissed,
  } = useKeyValue<boolean>({
    namespace: "global",
    key: ["dismiss-banner", id],
    fallback: false,
  });

  const shouldShow = !isLoading && !dismissed;

  useEffect(() => {
    if (shouldShow) {
      Promise.resolve(onShow?.()).catch(console.error);
    }
  }, [onShow, shouldShow]);

  if (!shouldShow) return null;

  const actionSize: ButtonProps["size"] = size === "xs" ? "2xs" : "xs";
  const stopParentClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const dismiss = (event: MouseEvent) => {
    stopParentClick(event);
    setDismissed(true).catch(console.error);
    Promise.resolve(onDismiss?.()).catch(console.error);
  };
  const isTip = variant === "tip";
  const hasActionRow = !isTip || (actions?.length ?? 0) > 0;

  return (
    <Banner
      className={classNames(className, "relative", size === "xs" && "!px-2 !py-2 text-xs")}
      {...props}
    >
      <div className={classNames("@container", isTip && "relative")}>
        {isTip && (
          <IconButton
            icon="x"
            size="2xs"
            iconSize="sm"
            title="Dismiss message"
            className="absolute! -top-0.5 -right-1 @[34rem]:top-1/2 @[34rem]:-translate-y-1/2 opacity-50 hover:opacity-100"
            onClick={dismiss}
          />
        )}
        <div
          className={classNames(
            "grid @[34rem]:grid-cols-[minmax(0,1fr)_auto] @[34rem]:items-center",
            isTip && "@[34rem]:pr-5",
            size === "xs" ? "gap-1.5 @[34rem]:gap-2" : "gap-2 @[34rem]:gap-3",
          )}
        >
          {isTip ? <div className="pr-5 @[34rem]:pr-0">{children}</div> : children}
          {hasActionRow && (
            <div className="flex flex-col gap-1.5 @[16rem]:flex-row @[16rem]:flex-wrap @[16rem]:justify-end">
              {!isTip && (
                <Button
                  variant="border"
                  color={props.color}
                  size={actionSize}
                  onClick={dismiss}
                  title="Dismiss message"
                >
                  Dismiss
                </Button>
              )}
              {actions?.map((a) => (
                <Button
                  key={a.label}
                  rightSlot={a.rightSlot}
                  variant={a.variant ?? "border"}
                  color={a.color ?? props.color}
                  size={actionSize}
                  onClick={(event) => {
                    stopParentClick(event);
                    a.onClick();
                  }}
                  title={a.label}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Banner>
  );
}
