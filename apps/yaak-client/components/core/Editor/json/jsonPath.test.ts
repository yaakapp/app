import { EditorState } from "@codemirror/state";
import { jsonc } from "@shopify/lang-jsonc";
import { forceParsing } from "@codemirror/language";
import { describe, expect, test } from "vite-plus/test";
import { jsonPathSegmentsAt, segmentsToJsonPath } from "./jsonPath";

function stateFor(doc: string): EditorState {
  const state = EditorState.create({ doc, extensions: [jsonc()] });
  // Ensure the whole doc is parsed so resolveInner sees a complete tree.
  forceParsing({ state } as never, doc.length, 5000);
  return state;
}

/** JSONPath produced when the cursor sits just after the first occurrence of `needle`. */
function pathAt(doc: string, needle: string): string {
  const pos = doc.indexOf(needle) + needle.length;
  const segs = jsonPathSegmentsAt(stateFor(doc), pos);
  if (segs == null) throw new Error("no JSON tree");
  return segmentsToJsonPath(segs);
}

describe("jsonPathSegmentsAt", () => {
  test("nested object keys", () => {
    const doc = `{ "address": { "geo": { "lat": "-37" } } }`;
    expect(pathAt(doc, `-37`)).toBe(`$.address.geo.lat`);
  });

  test("array element index", () => {
    const doc = `{ "featured": [ { "id": 1 }, { "id": 2 } ] }`;
    expect(pathAt(doc, `2`)).toBe(`$.featured[1].id`);
  });

  test("root array element", () => {
    const doc = `[ { "id": 1 }, { "id": 2 } ]`;
    expect(pathAt(doc, `"id": 2`)).toBe(`$[1].id`);
  });

  test("key containing a dot uses bracket-quote notation", () => {
    const doc = `{ "sort": { "link": { "filter": { "category.id": [ "100" ] } } } }`;
    expect(pathAt(doc, `"100"`)).toBe(`$.sort.link.filter["category.id"][0]`);
  });

  test("cursor on a property name resolves that key", () => {
    const doc = `{ "outer": { "inner": 5 } }`;
    expect(pathAt(doc, `"inner"`)).toBe(`$.outer.inner`);
  });

  test("deeply nested arrays and objects", () => {
    const doc = `{ "a": [ { "b": [ 10, 20, 30 ] } ] }`;
    expect(pathAt(doc, `30`)).toBe(`$.a[0].b[2]`);
  });

  test("root scalar yields the root path", () => {
    expect(pathAt(`"hello"`, `hello`)).toBe(`$`);
  });

  test("non-JSON documents return null", () => {
    const state = EditorState.create({ doc: `<xml/>` });
    expect(jsonPathSegmentsAt(state, 3)).toBeNull();
  });
});

describe("segmentsToJsonPath", () => {
  test("empty segment list is the root", () => {
    expect(segmentsToJsonPath([])).toBe(`$`);
  });

  test("partial path via count", () => {
    const segs = [
      { kind: "key", key: "a" },
      { kind: "index", index: 2 },
      { kind: "key", key: "b" },
    ] as const;
    expect(segmentsToJsonPath([...segs], 2)).toBe(`$.a[2]`);
  });
});
