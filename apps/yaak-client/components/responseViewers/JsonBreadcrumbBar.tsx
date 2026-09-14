import { Icon } from "@yaakapp-internal/ui";
import classNames from "classnames";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { JsonPathSegment } from "../core/Editor/json/jsonPath";
import { IconButton } from "../core/IconButton";

interface Props {
  segments: JsonPathSegment[];
  /** Called with the number of leading segments to isolate (0 = the root `$`). */
  onSelect: (count: number) => void;
}

/**
 * Shows where the cursor sits inside a JSON response, as a row of clickable
 * crumbs (`$ > sort > link > filter > "category.id" > 0`). Array indices are
 * their own crumbs so a click can isolate a single element. The row scrolls
 * horizontally, with arrows, when it's deeper than the pane is wide.
 */
export function JsonBreadcrumbBar({ segments, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (el == null) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setOverflow({
      left: el.scrollLeft > 1,
      right: el.scrollLeft < maxScroll - 1,
    });
  }, []);

  // Keep the deepest crumb (where the cursor is) in view as the path changes.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el == null) return;
    el.scrollLeft = el.scrollWidth;
    measure();
  }, [segments, measure]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el == null) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const scrollBy = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (el == null) return;
    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.6), behavior: "smooth" });
  }, []);

  return (
    <div className="flex items-center gap-0.5 h-7 text-sm text-text-subtle select-none">
      {overflow.left && (
        <IconButton
          size="xs"
          icon="chevron_left"
          title="Scroll breadcrumbs left"
          iconColor="secondary"
          onClick={() => scrollBy(-1)}
          className="shrink-0 h-auto!"
        />
      )}
      <div
        ref={scrollRef}
        onScroll={measure}
        className="flex items-center min-w-0 overflow-x-auto hide-scrollbars whitespace-nowrap"
      >
        <Crumb label="Root" tooltip="Show the whole response" onClick={() => onSelect(0)} isRoot />
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center shrink-0">
            <Icon icon="chevron_right" size="xs" className="text-text-subtlest mx-0.5 shrink-0" />
            <Crumb
              label={segment.kind === "index" ? String(segment.index) : segment.key}
              tooltip={
                segment.kind === "index"
                  ? `Filter to element ${segment.index}`
                  : `Filter to ${segment.key}`
              }
              isIndex={segment.kind === "index"}
              onClick={() => onSelect(i + 1)}
            />
          </div>
        ))}
      </div>
      {overflow.right && (
        <IconButton
          size="xs"
          icon="chevron_right"
          title="Scroll breadcrumbs right"
          iconColor="secondary"
          onClick={() => scrollBy(1)}
          className="shrink-0 h-auto!"
        />
      )}
    </div>
  );
}

function Crumb({
  label,
  tooltip,
  onClick,
  isIndex,
  isRoot,
}: {
  label: string;
  tooltip: string;
  onClick: () => void;
  isIndex?: boolean;
  isRoot?: boolean;
}) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className={classNames(
        "shrink-0 px-1 rounded hover:text-text hover:bg-surface-highlight transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus",
        isRoot && "text-text-subtle",
        isIndex && "font-mono text-info",
      )}
    >
      {label}
    </button>
  );
}
