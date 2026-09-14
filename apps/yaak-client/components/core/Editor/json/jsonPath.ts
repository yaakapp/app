import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";

/**
 * One step of a path into a JSON document. A `key` names an object member; an
 * `index` names a position within an array. They are kept separate so the UI
 * can show `items > 2` rather than folding the index into the key name.
 */
export type JsonPathSegment =
  | { readonly kind: "key"; readonly key: string }
  | { readonly kind: "index"; readonly index: number };

// Lezer node names from the JSONC grammar (@shopify/lang-jsonc). A JSON value is
// exactly one of these; everything else in the tree is punctuation or a comment.
const VALUE_NODES = new Set(["Object", "Array", "String", "Number", "True", "False", "Null"]);

/** Read a `PropertyName` (a quoted JSON string) back to its raw key. */
function keyFromPropertyName(node: SyntaxNode, state: EditorState): string {
  const raw = state.doc.sliceString(node.from, node.to);
  try {
    return JSON.parse(raw) as string;
  } catch {
    // A half-typed or malformed key still deserves a best-effort label.
    return raw.replace(/^"|"$/g, "");
  }
}

/** Index of `child` among the value elements of its parent `Array` node. */
function indexInArray(array: SyntaxNode, child: SyntaxNode, pos: number): number {
  const starts: number[] = [];
  for (let c = array.firstChild; c != null; c = c.nextSibling) {
    if (VALUE_NODES.has(c.name)) starts.push(c.from);
  }
  const exact = starts.indexOf(child.from);
  if (exact >= 0) return exact;
  // Cursor landed on punctuation (a comma, a bracket). Attribute it to the last
  // element that begins at or before the cursor, or the first if none do yet.
  let idx = 0;
  for (const start of starts) {
    if (start <= pos) idx = Math.max(idx, starts.indexOf(start));
    else break;
  }
  return idx;
}

/**
 * The path from the document root to the node under `pos`, or `null` when the
 * document has no JSON tree (a different language, or empty). An empty array
 * means the cursor sits at the root value itself.
 *
 * The walk climbs parent links: crossing into a `Property` contributes its key,
 * crossing into an `Array` contributes the element index. That yields segments
 * deepest-last after the reversal.
 */
export function jsonPathSegmentsAt(state: EditorState, pos: number): JsonPathSegment[] | null {
  const tree = syntaxTree(state);
  if (tree.type.name !== "JsoncText" && tree.topNode.name !== "JsoncText") return null;

  const segments: JsonPathSegment[] = [];
  let node: SyntaxNode | null = tree.resolveInner(pos, -1);

  while (node != null) {
    const parent: SyntaxNode | null = node.parent;
    if (parent == null) break;

    if (parent.name === "Property") {
      const nameNode = parent.getChild("PropertyName");
      if (nameNode != null) {
        segments.push({ kind: "key", key: keyFromPropertyName(nameNode, state) });
      }
      node = parent;
    } else if (parent.name === "Array") {
      segments.push({ kind: "index", index: indexInArray(parent, node, pos) });
      node = parent;
    } else {
      node = parent;
    }
  }

  segments.reverse();
  return segments;
}

const BARE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** A single segment as JSONPath, choosing dot vs. bracket form for a key. */
function segmentToJsonPath(segment: JsonPathSegment): string {
  if (segment.kind === "index") return `[${segment.index}]`;
  if (BARE_KEY.test(segment.key)) return `.${segment.key}`;
  // Anything with a dot, space, quote, etc. must be a quoted bracket accessor.
  // JSON.stringify gives correct double-quoting and escaping, matching the
  // convention the JSONPath filter box already displays.
  return `[${JSON.stringify(segment.key)}]`;
}

/**
 * Build a JSONPath expression for the first `count` segments (all of them by
 * default). `segmentsToJsonPath([])` is the root, `$`.
 */
export function segmentsToJsonPath(segments: JsonPathSegment[], count = segments.length): string {
  return "$" + segments.slice(0, count).map(segmentToJsonPath).join("");
}
