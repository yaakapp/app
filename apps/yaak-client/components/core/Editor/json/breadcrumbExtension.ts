import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type { JsonPathSegment } from "./jsonPath";
import { jsonPathSegmentsAt } from "./jsonPath";

export interface BreadcrumbUpdate {
  /** Path to the cursor, or `null` when the document isn't JSON. */
  segments: JsonPathSegment[] | null;
}

/**
 * Reports the JSON path under the cursor whenever the selection or document
 * changes. Selection works in read-only editors, so this drives the response
 * viewer's breadcrumb bar as the user clicks around a response.
 *
 * The callback is not fired on blur: moving focus to the filter box (by clicking
 * a crumb) must not erase the breadcrumb that was just acted on.
 */
export function jsonBreadcrumbExtension(onUpdate: (update: BreadcrumbUpdate) => void): Extension {
  return EditorView.updateListener.of((update) => {
    if (!update.selectionSet && !update.docChanged) return;
    const pos = update.state.selection.main.head;
    onUpdate({ segments: jsonPathSegmentsAt(update.state, pos) });
  });
}
