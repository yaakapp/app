const et = Symbol.for("yaml.alias"), Qe = Symbol.for("yaml.document"), V = Symbol.for("yaml.map"), $t = Symbol.for("yaml.pair"), U = Symbol.for("yaml.scalar"), le = Symbol.for("yaml.seq"), q = Symbol.for("yaml.node.type"), ae = (s) => !!s && typeof s == "object" && s[q] === et, Ce = (s) => !!s && typeof s == "object" && s[q] === Qe, we = (s) => !!s && typeof s == "object" && s[q] === V, L = (s) => !!s && typeof s == "object" && s[q] === $t, A = (s) => !!s && typeof s == "object" && s[q] === U, ke = (s) => !!s && typeof s == "object" && s[q] === le;
function E(s) {
  if (s && typeof s == "object")
    switch (s[q]) {
      case V:
      case le:
        return !0;
    }
  return !1;
}
function $(s) {
  if (s && typeof s == "object")
    switch (s[q]) {
      case et:
      case V:
      case U:
      case le:
        return !0;
    }
  return !1;
}
const cs = (s) => (A(s) || E(s)) && !!s.anchor, Y = Symbol("break visit"), fs = Symbol("skip children"), me = Symbol("remove node");
function H(s, e) {
  const t = us(e);
  Ce(s) ? ee(null, s.contents, t, Object.freeze([s])) === me && (s.contents = null) : ee(null, s, t, Object.freeze([]));
}
H.BREAK = Y;
H.SKIP = fs;
H.REMOVE = me;
function ee(s, e, t, n) {
  const i = hs(s, e, t, n);
  if ($(i) || L(i))
    return ds(s, n, i), ee(s, i, t, n);
  if (typeof i != "symbol") {
    if (E(e)) {
      n = Object.freeze(n.concat(e));
      for (let r = 0; r < e.items.length; ++r) {
        const o = ee(r, e.items[r], t, n);
        if (typeof o == "number")
          r = o - 1;
        else {
          if (o === Y)
            return Y;
          o === me && (e.items.splice(r, 1), r -= 1);
        }
      }
    } else if (L(e)) {
      n = Object.freeze(n.concat(e));
      const r = ee("key", e.key, t, n);
      if (r === Y)
        return Y;
      r === me && (e.key = null);
      const o = ee("value", e.value, t, n);
      if (o === Y)
        return Y;
      o === me && (e.value = null);
    }
  }
  return i;
}
function us(s) {
  return typeof s == "object" && (s.Collection || s.Node || s.Value) ? Object.assign({
    Alias: s.Node,
    Map: s.Node,
    Scalar: s.Node,
    Seq: s.Node
  }, s.Value && {
    Map: s.Value,
    Scalar: s.Value,
    Seq: s.Value
  }, s.Collection && {
    Map: s.Collection,
    Seq: s.Collection
  }, s) : s;
}
function hs(s, e, t, n) {
  var i, r, o, l, a;
  if (typeof t == "function")
    return t(s, e, n);
  if (we(e))
    return (i = t.Map) == null ? void 0 : i.call(t, s, e, n);
  if (ke(e))
    return (r = t.Seq) == null ? void 0 : r.call(t, s, e, n);
  if (L(e))
    return (o = t.Pair) == null ? void 0 : o.call(t, s, e, n);
  if (A(e))
    return (l = t.Scalar) == null ? void 0 : l.call(t, s, e, n);
  if (ae(e))
    return (a = t.Alias) == null ? void 0 : a.call(t, s, e, n);
}
function ds(s, e, t) {
  const n = e[e.length - 1];
  if (E(n))
    n.items[s] = t;
  else if (L(n))
    s === "key" ? n.key = t : n.value = t;
  else if (Ce(n))
    n.contents = t;
  else {
    const i = ae(n) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${i} parent`);
  }
}
const ps = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
}, ms = (s) => s.replace(/[!,[\]{}]/g, (e) => ps[e]);
class v {
  constructor(e, t) {
    this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, v.defaultYaml, e), this.tags = Object.assign({}, v.defaultTags, t);
  }
  clone() {
    const e = new v(this.yaml, this.tags);
    return e.docStart = this.docStart, e;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const e = new v(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = !0;
        break;
      case "1.2":
        this.atNextDocument = !1, this.yaml = {
          explicit: v.defaultYaml.explicit,
          version: "1.2"
        }, this.tags = Object.assign({}, v.defaultTags);
        break;
    }
    return e;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(e, t) {
    this.atNextDocument && (this.yaml = { explicit: v.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, v.defaultTags), this.atNextDocument = !1);
    const n = e.trim().split(/[ \t]+/), i = n.shift();
    switch (i) {
      case "%TAG": {
        if (n.length !== 2 && (t(0, "%TAG directive should contain exactly two parts"), n.length < 2))
          return !1;
        const [r, o] = n;
        return this.tags[r] = o, !0;
      }
      case "%YAML": {
        if (this.yaml.explicit = !0, n.length !== 1)
          return t(0, "%YAML directive should contain exactly one part"), !1;
        const [r] = n;
        if (r === "1.1" || r === "1.2")
          return this.yaml.version = r, !0;
        {
          const o = /^\d+\.\d+$/.test(r);
          return t(6, `Unsupported YAML version ${r}`, o), !1;
        }
      }
      default:
        return t(0, `Unknown directive ${i}`, !0), !1;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(e, t) {
    if (e === "!")
      return "!";
    if (e[0] !== "!")
      return t(`Not a valid tag: ${e}`), null;
    if (e[1] === "<") {
      const o = e.slice(2, -1);
      return o === "!" || o === "!!" ? (t(`Verbatim tags aren't resolved, so ${e} is invalid.`), null) : (e[e.length - 1] !== ">" && t("Verbatim tags must end with a >"), o);
    }
    const [, n, i] = e.match(/^(.*!)([^!]*)$/s);
    i || t(`The ${e} tag has no suffix`);
    const r = this.tags[n];
    if (r)
      try {
        return r + decodeURIComponent(i);
      } catch (o) {
        return t(String(o)), null;
      }
    return n === "!" ? e : (t(`Could not resolve tag: ${e}`), null);
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(e) {
    for (const [t, n] of Object.entries(this.tags))
      if (e.startsWith(n))
        return t + ms(e.substring(n.length));
    return e[0] === "!" ? e : `!<${e}>`;
  }
  toString(e) {
    const t = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], n = Object.entries(this.tags);
    let i;
    if (e && n.length > 0 && $(e.contents)) {
      const r = {};
      H(e.contents, (o, l) => {
        $(l) && l.tag && (r[l.tag] = !0);
      }), i = Object.keys(r);
    } else
      i = [];
    for (const [r, o] of n)
      r === "!!" && o === "tag:yaml.org,2002:" || (!e || i.some((l) => l.startsWith(o))) && t.push(`%TAG ${r} ${o}`);
    return t.join(`
`);
  }
}
v.defaultYaml = { explicit: !1, version: "1.2" };
v.defaultTags = { "!!": "tag:yaml.org,2002:" };
function _t(s) {
  if (/[\x00-\x19\s,[\]{}]/.test(s)) {
    const t = `Anchor must not contain whitespace or control characters: ${JSON.stringify(s)}`;
    throw new Error(t);
  }
  return !0;
}
function Ct(s) {
  const e = /* @__PURE__ */ new Set();
  return H(s, {
    Value(t, n) {
      n.anchor && e.add(n.anchor);
    }
  }), e;
}
function vt(s, e) {
  for (let t = 1; ; ++t) {
    const n = `${s}${t}`;
    if (!e.has(n))
      return n;
  }
}
function gs(s, e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let i = null;
  return {
    onAnchor: (r) => {
      t.push(r), i || (i = Ct(s));
      const o = vt(e, i);
      return i.add(o), o;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const r of t) {
        const o = n.get(r);
        if (typeof o == "object" && o.anchor && (A(o.node) || E(o.node)))
          o.node.anchor = o.anchor;
        else {
          const l = new Error("Failed to resolve repeated object (this should not happen)");
          throw l.source = r, l;
        }
      }
    },
    sourceObjects: n
  };
}
function te(s, e, t, n) {
  if (n && typeof n == "object")
    if (Array.isArray(n))
      for (let i = 0, r = n.length; i < r; ++i) {
        const o = n[i], l = te(s, n, String(i), o);
        l === void 0 ? delete n[i] : l !== o && (n[i] = l);
      }
    else if (n instanceof Map)
      for (const i of Array.from(n.keys())) {
        const r = n.get(i), o = te(s, n, i, r);
        o === void 0 ? n.delete(i) : o !== r && n.set(i, o);
      }
    else if (n instanceof Set)
      for (const i of Array.from(n)) {
        const r = te(s, n, i, i);
        r === void 0 ? n.delete(i) : r !== i && (n.delete(i), n.add(r));
      }
    else
      for (const [i, r] of Object.entries(n)) {
        const o = te(s, n, i, r);
        o === void 0 ? delete n[i] : o !== r && (n[i] = o);
      }
  return s.call(e, t, n);
}
function P(s, e, t) {
  if (Array.isArray(s))
    return s.map((n, i) => P(n, String(i), t));
  if (s && typeof s.toJSON == "function") {
    if (!t || !cs(s))
      return s.toJSON(e, t);
    const n = { aliasCount: 0, count: 1, res: void 0 };
    t.anchors.set(s, n), t.onCreate = (r) => {
      n.res = r, delete t.onCreate;
    };
    const i = s.toJSON(e, t);
    return t.onCreate && t.onCreate(i), i;
  }
  return typeof s == "bigint" && !(t != null && t.keep) ? Number(s) : s;
}
class tt {
  constructor(e) {
    Object.defineProperty(this, q, { value: e });
  }
  /** Create a copy of this node.  */
  clone() {
    const e = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return this.range && (e.range = this.range.slice()), e;
  }
  /** A plain JavaScript representation of this node. */
  toJS(e, { mapAsMap: t, maxAliasCount: n, onAnchor: i, reviver: r } = {}) {
    if (!Ce(e))
      throw new TypeError("A document argument is required");
    const o = {
      anchors: /* @__PURE__ */ new Map(),
      doc: e,
      keep: !0,
      mapAsMap: t === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof n == "number" ? n : 100
    }, l = P(this, "", o);
    if (typeof i == "function")
      for (const { count: a, res: c } of o.anchors.values())
        i(c, a);
    return typeof r == "function" ? te(r, { "": l }, "", l) : l;
  }
}
class st extends tt {
  constructor(e) {
    super(et), this.source = e, Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(e) {
    let t;
    return H(e, {
      Node: (n, i) => {
        if (i === this)
          return H.BREAK;
        i.anchor === this.source && (t = i);
      }
    }), t;
  }
  toJSON(e, t) {
    if (!t)
      return { source: this.source };
    const { anchors: n, doc: i, maxAliasCount: r } = t, o = this.resolve(i);
    if (!o) {
      const a = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(a);
    }
    let l = n.get(o);
    if (l || (P(o, null, t), l = n.get(o)), !l || l.res === void 0) {
      const a = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(a);
    }
    if (r >= 0 && (l.count += 1, l.aliasCount === 0 && (l.aliasCount = Te(i, o, n)), l.count * l.aliasCount > r)) {
      const a = "Excessive alias count indicates a resource exhaustion attack";
      throw new ReferenceError(a);
    }
    return l.res;
  }
  toString(e, t, n) {
    const i = `*${this.source}`;
    if (e) {
      if (_t(this.source), e.options.verifyAliasOrder && !e.anchors.has(this.source)) {
        const r = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(r);
      }
      if (e.implicitKey)
        return `${i} `;
    }
    return i;
  }
}
function Te(s, e, t) {
  if (ae(e)) {
    const n = e.resolve(s), i = t && n && t.get(n);
    return i ? i.count * i.aliasCount : 0;
  } else if (E(e)) {
    let n = 0;
    for (const i of e.items) {
      const r = Te(s, i, t);
      r > n && (n = r);
    }
    return n;
  } else if (L(e)) {
    const n = Te(s, e.key, t), i = Te(s, e.value, t);
    return Math.max(n, i);
  }
  return 1;
}
const Bt = (s) => !s || typeof s != "function" && typeof s != "object";
class N extends tt {
  constructor(e) {
    super(U), this.value = e;
  }
  toJSON(e, t) {
    return t != null && t.keep ? this.value : P(this.value, e, t);
  }
  toString() {
    return String(this.value);
  }
}
N.BLOCK_FOLDED = "BLOCK_FOLDED";
N.BLOCK_LITERAL = "BLOCK_LITERAL";
N.PLAIN = "PLAIN";
N.QUOTE_DOUBLE = "QUOTE_DOUBLE";
N.QUOTE_SINGLE = "QUOTE_SINGLE";
const ys = "tag:yaml.org,2002:";
function bs(s, e, t) {
  if (e) {
    const n = t.filter((r) => r.tag === e), i = n.find((r) => !r.format) ?? n[0];
    if (!i)
      throw new Error(`Tag ${e} not found`);
    return i;
  }
  return t.find((n) => {
    var i;
    return ((i = n.identify) == null ? void 0 : i.call(n, s)) && !n.format;
  });
}
function ye(s, e, t) {
  var f, u, m;
  if (Ce(s) && (s = s.contents), $(s))
    return s;
  if (L(s)) {
    const y = (u = (f = t.schema[V]).createNode) == null ? void 0 : u.call(f, t.schema, null, t);
    return y.items.push(s), y;
  }
  (s instanceof String || s instanceof Number || s instanceof Boolean || typeof BigInt < "u" && s instanceof BigInt) && (s = s.valueOf());
  const { aliasDuplicateObjects: n, onAnchor: i, onTagObj: r, schema: o, sourceObjects: l } = t;
  let a;
  if (n && s && typeof s == "object") {
    if (a = l.get(s), a)
      return a.anchor || (a.anchor = i(s)), new st(a.anchor);
    a = { anchor: null, node: null }, l.set(s, a);
  }
  e != null && e.startsWith("!!") && (e = ys + e.slice(2));
  let c = bs(s, e, o.tags);
  if (!c) {
    if (s && typeof s.toJSON == "function" && (s = s.toJSON()), !s || typeof s != "object") {
      const y = new N(s);
      return a && (a.node = y), y;
    }
    c = s instanceof Map ? o[V] : Symbol.iterator in Object(s) ? o[le] : o[V];
  }
  r && (r(c), delete t.onTagObj);
  const d = c != null && c.createNode ? c.createNode(t.schema, s, t) : typeof ((m = c == null ? void 0 : c.nodeClass) == null ? void 0 : m.from) == "function" ? c.nodeClass.from(t.schema, s, t) : new N(s);
  return e ? d.tag = e : c.default || (d.tag = c.tag), a && (a.node = d), d;
}
function $e(s, e, t) {
  let n = t;
  for (let i = e.length - 1; i >= 0; --i) {
    const r = e[i];
    if (typeof r == "number" && Number.isInteger(r) && r >= 0) {
      const o = [];
      o[r] = n, n = o;
    } else
      n = /* @__PURE__ */ new Map([[r, n]]);
  }
  return ye(n, void 0, {
    aliasDuplicateObjects: !1,
    keepUndefined: !1,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: s,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const de = (s) => s == null || typeof s == "object" && !!s[Symbol.iterator]().next().done;
class nt extends tt {
  constructor(e, t) {
    super(e), Object.defineProperty(this, "schema", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !0
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(e) {
    const t = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return e && (t.schema = e), t.items = t.items.map((n) => $(n) || L(n) ? n.clone(e) : n), this.range && (t.range = this.range.slice()), t;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(e, t) {
    if (de(e))
      this.add(t);
    else {
      const [n, ...i] = e, r = this.get(n, !0);
      if (E(r))
        r.addIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, $e(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.delete(t);
    const i = this.get(t, !0);
    if (E(i))
      return i.deleteIn(n);
    throw new Error(`Expected YAML collection at ${t}. Remaining path: ${n}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    const [n, ...i] = e, r = this.get(n, !0);
    return i.length === 0 ? !t && A(r) ? r.value : r : E(r) ? r.getIn(i, t) : void 0;
  }
  hasAllNullValues(e) {
    return this.items.every((t) => {
      if (!L(t))
        return !1;
      const n = t.value;
      return n == null || e && A(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.has(t);
    const i = this.get(t, !0);
    return E(i) ? i.hasIn(n) : !1;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    const [n, ...i] = e;
    if (i.length === 0)
      this.set(n, t);
    else {
      const r = this.get(n, !0);
      if (E(r))
        r.setIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, $e(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
}
nt.maxFlowStringSingleLineLength = 60;
const ws = (s) => s.replace(/^(?!$)(?: $)?/gm, "#");
function F(s, e) {
  return /^\n+$/.test(s) ? s.substring(1) : e ? s.replace(/^(?! *$)/gm, e) : s;
}
const W = (s, e, t) => s.endsWith(`
`) ? F(t, e) : t.includes(`
`) ? `
` + F(t, e) : (s.endsWith(" ") ? "" : " ") + t, Dt = "flow", He = "block", Ee = "quoted";
function ve(s, e, t = "flow", { indentAtStart: n, lineWidth: i = 80, minContentWidth: r = 20, onFold: o, onOverflow: l } = {}) {
  if (!i || i < 0)
    return s;
  const a = Math.max(1 + r, 1 + i - e.length);
  if (s.length <= a)
    return s;
  const c = [], d = {};
  let f = i - e.length;
  typeof n == "number" && (n > i - Math.max(2, r) ? c.push(0) : f = i - n);
  let u, m, y = !1, h = -1, p = -1, b = -1;
  t === He && (h = gt(s, h, e.length), h !== -1 && (f = h + a));
  for (let S; S = s[h += 1]; ) {
    if (t === Ee && S === "\\") {
      switch (p = h, s[h + 1]) {
        case "x":
          h += 3;
          break;
        case "u":
          h += 5;
          break;
        case "U":
          h += 9;
          break;
        default:
          h += 1;
      }
      b = h;
    }
    if (S === `
`)
      t === He && (h = gt(s, h, e.length)), f = h + e.length + a, u = void 0;
    else {
      if (S === " " && m && m !== " " && m !== `
` && m !== "	") {
        const k = s[h + 1];
        k && k !== " " && k !== `
` && k !== "	" && (u = h);
      }
      if (h >= f)
        if (u)
          c.push(u), f = u + a, u = void 0;
        else if (t === Ee) {
          for (; m === " " || m === "	"; )
            m = S, S = s[h += 1], y = !0;
          const k = h > b + 1 ? h - 2 : p - 1;
          if (d[k])
            return s;
          c.push(k), d[k] = !0, f = k + a, u = void 0;
        } else
          y = !0;
    }
    m = S;
  }
  if (y && l && l(), c.length === 0)
    return s;
  o && o();
  let w = s.slice(0, c[0]);
  for (let S = 0; S < c.length; ++S) {
    const k = c[S], O = c[S + 1] || s.length;
    k === 0 ? w = `
${e}${s.slice(0, O)}` : (t === Ee && d[k] && (w += `${s[k]}\\`), w += `
${e}${s.slice(k + 1, O)}`);
  }
  return w;
}
function gt(s, e, t) {
  let n = e, i = e + 1, r = s[i];
  for (; r === " " || r === "	"; )
    if (e < i + t)
      r = s[++e];
    else {
      do
        r = s[++e];
      while (r && r !== `
`);
      n = e, i = e + 1, r = s[i];
    }
  return n;
}
const Be = (s, e) => ({
  indentAtStart: e ? s.indent.length : s.indentAtStart,
  lineWidth: s.options.lineWidth,
  minContentWidth: s.options.minContentWidth
}), De = (s) => /^(%|---|\.\.\.)/m.test(s);
function ks(s, e, t) {
  if (!e || e < 0)
    return !1;
  const n = e - t, i = s.length;
  if (i <= n)
    return !1;
  for (let r = 0, o = 0; r < i; ++r)
    if (s[r] === `
`) {
      if (r - o > n)
        return !0;
      if (o = r + 1, i - o <= n)
        return !1;
    }
  return !0;
}
function ge(s, e) {
  const t = JSON.stringify(s);
  if (e.options.doubleQuotedAsJSON)
    return t;
  const { implicitKey: n } = e, i = e.options.doubleQuotedMinMultiLineLength, r = e.indent || (De(s) ? "  " : "");
  let o = "", l = 0;
  for (let a = 0, c = t[a]; c; c = t[++a])
    if (c === " " && t[a + 1] === "\\" && t[a + 2] === "n" && (o += t.slice(l, a) + "\\ ", a += 1, l = a, c = "\\"), c === "\\")
      switch (t[a + 1]) {
        case "u":
          {
            o += t.slice(l, a);
            const d = t.substr(a + 2, 4);
            switch (d) {
              case "0000":
                o += "\\0";
                break;
              case "0007":
                o += "\\a";
                break;
              case "000b":
                o += "\\v";
                break;
              case "001b":
                o += "\\e";
                break;
              case "0085":
                o += "\\N";
                break;
              case "00a0":
                o += "\\_";
                break;
              case "2028":
                o += "\\L";
                break;
              case "2029":
                o += "\\P";
                break;
              default:
                d.substr(0, 2) === "00" ? o += "\\x" + d.substr(2) : o += t.substr(a, 6);
            }
            a += 5, l = a + 1;
          }
          break;
        case "n":
          if (n || t[a + 2] === '"' || t.length < i)
            a += 1;
          else {
            for (o += t.slice(l, a) + `

`; t[a + 2] === "\\" && t[a + 3] === "n" && t[a + 4] !== '"'; )
              o += `
`, a += 2;
            o += r, t[a + 2] === " " && (o += "\\"), a += 1, l = a + 1;
          }
          break;
        default:
          a += 1;
      }
  return o = l ? o + t.slice(l) : t, n ? o : ve(o, r, Ee, Be(e, !1));
}
function Xe(s, e) {
  if (e.options.singleQuote === !1 || e.implicitKey && s.includes(`
`) || /[ \t]\n|\n[ \t]/.test(s))
    return ge(s, e);
  const t = e.indent || (De(s) ? "  " : ""), n = "'" + s.replace(/'/g, "''").replace(/\n+/g, `$&
${t}`) + "'";
  return e.implicitKey ? n : ve(n, t, Dt, Be(e, !1));
}
function se(s, e) {
  const { singleQuote: t } = e.options;
  let n;
  if (t === !1)
    n = ge;
  else {
    const i = s.includes('"'), r = s.includes("'");
    i && !r ? n = Xe : r && !i ? n = ge : n = t ? Xe : ge;
  }
  return n(s, e);
}
let Ze;
try {
  Ze = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
} catch {
  Ze = /\n+(?!\n|$)/g;
}
function Le({ comment: s, type: e, value: t }, n, i, r) {
  const { blockQuote: o, commentString: l, lineWidth: a } = n.options;
  if (!o || /\n[\t ]+$/.test(t) || /^\s*$/.test(t))
    return se(t, n);
  const c = n.indent || (n.forceBlockIndent || De(t) ? "  " : ""), d = o === "literal" ? !0 : o === "folded" || e === N.BLOCK_FOLDED ? !1 : e === N.BLOCK_LITERAL ? !0 : !ks(t, a, c.length);
  if (!t)
    return d ? `|
` : `>
`;
  let f, u;
  for (u = t.length; u > 0; --u) {
    const g = t[u - 1];
    if (g !== `
` && g !== "	" && g !== " ")
      break;
  }
  let m = t.substring(u);
  const y = m.indexOf(`
`);
  y === -1 ? f = "-" : t === m || y !== m.length - 1 ? (f = "+", r && r()) : f = "", m && (t = t.slice(0, -m.length), m[m.length - 1] === `
` && (m = m.slice(0, -1)), m = m.replace(Ze, `$&${c}`));
  let h = !1, p, b = -1;
  for (p = 0; p < t.length; ++p) {
    const g = t[p];
    if (g === " ")
      h = !0;
    else if (g === `
`)
      b = p;
    else
      break;
  }
  let w = t.substring(0, b < p ? b + 1 : p);
  w && (t = t.substring(w.length), w = w.replace(/\n+/g, `$&${c}`));
  let k = (d ? "|" : ">") + (h ? c ? "2" : "1" : "") + f;
  if (s && (k += " " + l(s.replace(/ ?[\r\n]+/g, " ")), i && i()), d)
    return t = t.replace(/\n+/g, `$&${c}`), `${k}
${c}${w}${t}${m}`;
  t = t.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${c}`);
  const O = ve(`${w}${t}${m}`, c, He, Be(n, !0));
  return `${k}
${c}${O}`;
}
function Ss(s, e, t, n) {
  const { type: i, value: r } = s, { actualString: o, implicitKey: l, indent: a, indentStep: c, inFlow: d } = e;
  if (l && r.includes(`
`) || d && /[[\]{},]/.test(r))
    return se(r, e);
  if (!r || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(r))
    return l || d || !r.includes(`
`) ? se(r, e) : Le(s, e, t, n);
  if (!l && !d && i !== N.PLAIN && r.includes(`
`))
    return Le(s, e, t, n);
  if (De(r)) {
    if (a === "")
      return e.forceBlockIndent = !0, Le(s, e, t, n);
    if (l && a === c)
      return se(r, e);
  }
  const f = r.replace(/\n+/g, `$&
${a}`);
  if (o) {
    const u = (h) => {
      var p;
      return h.default && h.tag !== "tag:yaml.org,2002:str" && ((p = h.test) == null ? void 0 : p.test(f));
    }, { compat: m, tags: y } = e.doc.schema;
    if (y.some(u) || m != null && m.some(u))
      return se(r, e);
  }
  return l ? f : ve(f, a, Dt, Be(e, !1));
}
function it(s, e, t, n) {
  const { implicitKey: i, inFlow: r } = e, o = typeof s.value == "string" ? s : Object.assign({}, s, { value: String(s.value) });
  let { type: l } = s;
  l !== N.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value) && (l = N.QUOTE_DOUBLE);
  const a = (d) => {
    switch (d) {
      case N.BLOCK_FOLDED:
      case N.BLOCK_LITERAL:
        return i || r ? se(o.value, e) : Le(o, e, t, n);
      case N.QUOTE_DOUBLE:
        return ge(o.value, e);
      case N.QUOTE_SINGLE:
        return Xe(o.value, e);
      case N.PLAIN:
        return Ss(o, e, t, n);
      default:
        return null;
    }
  };
  let c = a(l);
  if (c === null) {
    const { defaultKeyType: d, defaultStringType: f } = e.options, u = i && d || f;
    if (c = a(u), c === null)
      throw new Error(`Unsupported default string type ${u}`);
  }
  return c;
}
function Mt(s, e) {
  const t = Object.assign({
    blockQuote: !0,
    commentString: ws,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: !1,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: !0,
    indentSeq: !0,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: !1,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: !0
  }, s.schema.toStringOptions, e);
  let n;
  switch (t.collectionStyle) {
    case "block":
      n = !1;
      break;
    case "flow":
      n = !0;
      break;
    default:
      n = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc: s,
    flowCollectionPadding: t.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
    inFlow: n,
    options: t
  };
}
function Ns(s, e) {
  var i;
  if (e.tag) {
    const r = s.filter((o) => o.tag === e.tag);
    if (r.length > 0)
      return r.find((o) => o.format === e.format) ?? r[0];
  }
  let t, n;
  if (A(e)) {
    n = e.value;
    const r = s.filter((o) => {
      var l;
      return (l = o.identify) == null ? void 0 : l.call(o, n);
    });
    t = r.find((o) => o.format === e.format) ?? r.find((o) => !o.format);
  } else
    n = e, t = s.find((r) => r.nodeClass && n instanceof r.nodeClass);
  if (!t) {
    const r = ((i = n == null ? void 0 : n.constructor) == null ? void 0 : i.name) ?? typeof n;
    throw new Error(`Tag not resolved for ${r} value`);
  }
  return t;
}
function Os(s, e, { anchors: t, doc: n }) {
  if (!n.directives)
    return "";
  const i = [], r = (A(s) || E(s)) && s.anchor;
  r && _t(r) && (t.add(r), i.push(`&${r}`));
  const o = s.tag ? s.tag : e.default ? null : e.tag;
  return o && i.push(n.directives.tagString(o)), i.join(" ");
}
function re(s, e, t, n) {
  var a;
  if (L(s))
    return s.toString(e, t, n);
  if (ae(s)) {
    if (e.doc.directives)
      return s.toString(e);
    if ((a = e.resolvedAliases) != null && a.has(s))
      throw new TypeError("Cannot stringify circular structure without alias nodes");
    e.resolvedAliases ? e.resolvedAliases.add(s) : e.resolvedAliases = /* @__PURE__ */ new Set([s]), s = s.resolve(e.doc);
  }
  let i;
  const r = $(s) ? s : e.doc.createNode(s, { onTagObj: (c) => i = c });
  i || (i = Ns(e.doc.schema.tags, r));
  const o = Os(r, i, e);
  o.length > 0 && (e.indentAtStart = (e.indentAtStart ?? 0) + o.length + 1);
  const l = typeof i.stringify == "function" ? i.stringify(r, e, t, n) : A(r) ? it(r, e, t, n) : r.toString(e, t, n);
  return o ? A(r) || l[0] === "{" || l[0] === "[" ? `${o} ${l}` : `${o}
${e.indent}${l}` : l;
}
function As({ key: s, value: e }, t, n, i) {
  const { allNullValues: r, doc: o, indent: l, indentStep: a, options: { commentString: c, indentSeq: d, simpleKeys: f } } = t;
  let u = $(s) && s.comment || null;
  if (f) {
    if (u)
      throw new Error("With simple keys, key nodes cannot have comments");
    if (E(s)) {
      const I = "With simple keys, collection cannot be used as a key value";
      throw new Error(I);
    }
  }
  let m = !f && (!s || u && e == null && !t.inFlow || E(s) || (A(s) ? s.type === N.BLOCK_FOLDED || s.type === N.BLOCK_LITERAL : typeof s == "object"));
  t = Object.assign({}, t, {
    allNullValues: !1,
    implicitKey: !m && (f || !r),
    indent: l + a
  });
  let y = !1, h = !1, p = re(s, t, () => y = !0, () => h = !0);
  if (!m && !t.inFlow && p.length > 1024) {
    if (f)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    m = !0;
  }
  if (t.inFlow) {
    if (r || e == null)
      return y && n && n(), p === "" ? "?" : m ? `? ${p}` : p;
  } else if (r && !f || e == null && m)
    return p = `? ${p}`, u && !y ? p += W(p, t.indent, c(u)) : h && i && i(), p;
  y && (u = null), m ? (u && (p += W(p, t.indent, c(u))), p = `? ${p}
${l}:`) : (p = `${p}:`, u && (p += W(p, t.indent, c(u))));
  let b, w, S;
  $(e) ? (b = !!e.spaceBefore, w = e.commentBefore, S = e.comment) : (b = !1, w = null, S = null, e && typeof e == "object" && (e = o.createNode(e))), t.implicitKey = !1, !m && !u && A(e) && (t.indentAtStart = p.length + 1), h = !1, !d && a.length >= 2 && !t.inFlow && !m && ke(e) && !e.flow && !e.tag && !e.anchor && (t.indent = t.indent.substring(2));
  let k = !1;
  const O = re(e, t, () => k = !0, () => h = !0);
  let g = " ";
  if (u || b || w) {
    if (g = b ? `
` : "", w) {
      const I = c(w);
      g += `
${F(I, t.indent)}`;
    }
    O === "" && !t.inFlow ? g === `
` && (g = `

`) : g += `
${t.indent}`;
  } else if (!m && E(e)) {
    const I = O[0], T = O.indexOf(`
`), C = T !== -1, J = t.inFlow ?? e.flow ?? e.items.length === 0;
    if (C || !J) {
      let Z = !1;
      if (C && (I === "&" || I === "!")) {
        let _ = O.indexOf(" ");
        I === "&" && _ !== -1 && _ < T && O[_ + 1] === "!" && (_ = O.indexOf(" ", _ + 1)), (_ === -1 || T < _) && (Z = !0);
      }
      Z || (g = `
${t.indent}`);
    }
  } else
    (O === "" || O[0] === `
`) && (g = "");
  return p += g + O, t.inFlow ? k && n && n() : S && !k ? p += W(p, t.indent, c(S)) : h && i && i(), p;
}
function Pt(s, e) {
  (s === "debug" || s === "warn") && (typeof process < "u" && process.emitWarning ? process.emitWarning(e) : console.warn(e));
}
const yt = "<<";
function jt(s, e, { key: t, value: n }) {
  if (s != null && s.doc.schema.merge && Is(t))
    if (n = ae(n) ? n.resolve(s.doc) : n, ke(n))
      for (const i of n.items)
        Fe(s, e, i);
    else if (Array.isArray(n))
      for (const i of n)
        Fe(s, e, i);
    else
      Fe(s, e, n);
  else {
    const i = P(t, "", s);
    if (e instanceof Map)
      e.set(i, P(n, i, s));
    else if (e instanceof Set)
      e.add(i);
    else {
      const r = Ts(t, i, s), o = P(n, r, s);
      r in e ? Object.defineProperty(e, r, {
        value: o,
        writable: !0,
        enumerable: !0,
        configurable: !0
      }) : e[r] = o;
    }
  }
  return e;
}
const Is = (s) => s === yt || A(s) && s.value === yt && (!s.type || s.type === N.PLAIN);
function Fe(s, e, t) {
  const n = s && ae(t) ? t.resolve(s.doc) : t;
  if (!we(n))
    throw new Error("Merge sources must be maps or map aliases");
  const i = n.toJSON(null, s, Map);
  for (const [r, o] of i)
    e instanceof Map ? e.has(r) || e.set(r, o) : e instanceof Set ? e.add(r) : Object.prototype.hasOwnProperty.call(e, r) || Object.defineProperty(e, r, {
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  return e;
}
function Ts(s, e, t) {
  if (e === null)
    return "";
  if (typeof e != "object")
    return String(e);
  if ($(s) && (t != null && t.doc)) {
    const n = Mt(t.doc, {});
    n.anchors = /* @__PURE__ */ new Set();
    for (const r of t.anchors.keys())
      n.anchors.add(r.anchor);
    n.inFlow = !0, n.inStringifyKey = !0;
    const i = s.toString(n);
    if (!t.mapKeyWarned) {
      let r = JSON.stringify(i);
      r.length > 40 && (r = r.substring(0, 36) + '..."'), Pt(t.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${r}. Set mapAsMap: true to use object keys.`), t.mapKeyWarned = !0;
    }
    return i;
  }
  return JSON.stringify(e);
}
function rt(s, e, t) {
  const n = ye(s, void 0, t), i = ye(e, void 0, t);
  return new B(n, i);
}
class B {
  constructor(e, t = null) {
    Object.defineProperty(this, q, { value: $t }), this.key = e, this.value = t;
  }
  clone(e) {
    let { key: t, value: n } = this;
    return $(t) && (t = t.clone(e)), $(n) && (n = n.clone(e)), new B(t, n);
  }
  toJSON(e, t) {
    const n = t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return jt(t, n, this);
  }
  toString(e, t, n) {
    return e != null && e.doc ? As(this, e, t, n) : JSON.stringify(this);
  }
}
function qt(s, e, t) {
  return (e.inFlow ?? s.flow ? Ls : Es)(s, e, t);
}
function Es({ comment: s, items: e }, t, { blockItemPrefix: n, flowChars: i, itemIndent: r, onChompKeep: o, onComment: l }) {
  const { indent: a, options: { commentString: c } } = t, d = Object.assign({}, t, { indent: r, type: null });
  let f = !1;
  const u = [];
  for (let y = 0; y < e.length; ++y) {
    const h = e[y];
    let p = null;
    if ($(h))
      !f && h.spaceBefore && u.push(""), _e(t, u, h.commentBefore, f), h.comment && (p = h.comment);
    else if (L(h)) {
      const w = $(h.key) ? h.key : null;
      w && (!f && w.spaceBefore && u.push(""), _e(t, u, w.commentBefore, f));
    }
    f = !1;
    let b = re(h, d, () => p = null, () => f = !0);
    p && (b += W(b, r, c(p))), f && p && (f = !1), u.push(n + b);
  }
  let m;
  if (u.length === 0)
    m = i.start + i.end;
  else {
    m = u[0];
    for (let y = 1; y < u.length; ++y) {
      const h = u[y];
      m += h ? `
${a}${h}` : `
`;
    }
  }
  return s ? (m += `
` + F(c(s), a), l && l()) : f && o && o(), m;
}
function Ls({ items: s }, e, { flowChars: t, itemIndent: n }) {
  const { indent: i, indentStep: r, flowCollectionPadding: o, options: { commentString: l } } = e;
  n += r;
  const a = Object.assign({}, e, {
    indent: n,
    inFlow: !0,
    type: null
  });
  let c = !1, d = 0;
  const f = [];
  for (let y = 0; y < s.length; ++y) {
    const h = s[y];
    let p = null;
    if ($(h))
      h.spaceBefore && f.push(""), _e(e, f, h.commentBefore, !1), h.comment && (p = h.comment);
    else if (L(h)) {
      const w = $(h.key) ? h.key : null;
      w && (w.spaceBefore && f.push(""), _e(e, f, w.commentBefore, !1), w.comment && (c = !0));
      const S = $(h.value) ? h.value : null;
      S ? (S.comment && (p = S.comment), S.commentBefore && (c = !0)) : h.value == null && (w != null && w.comment) && (p = w.comment);
    }
    p && (c = !0);
    let b = re(h, a, () => p = null);
    y < s.length - 1 && (b += ","), p && (b += W(b, n, l(p))), !c && (f.length > d || b.includes(`
`)) && (c = !0), f.push(b), d = f.length;
  }
  const { start: u, end: m } = t;
  if (f.length === 0)
    return u + m;
  if (!c) {
    const y = f.reduce((h, p) => h + p.length + 2, 2);
    c = e.options.lineWidth > 0 && y > e.options.lineWidth;
  }
  if (c) {
    let y = u;
    for (const h of f)
      y += h ? `
${r}${i}${h}` : `
`;
    return `${y}
${i}${m}`;
  } else
    return `${u}${o}${f.join(" ")}${o}${m}`;
}
function _e({ indent: s, options: { commentString: e } }, t, n, i) {
  if (n && i && (n = n.replace(/^\n+/, "")), n) {
    const r = F(e(n), s);
    t.push(r.trimStart());
  }
}
function Q(s, e) {
  const t = A(e) ? e.value : e;
  for (const n of s)
    if (L(n) && (n.key === e || n.key === t || A(n.key) && n.key.value === t))
      return n;
}
class M extends nt {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(e) {
    super(V, e), this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(e, t, n) {
    const { keepUndefined: i, replacer: r } = n, o = new this(e), l = (a, c) => {
      if (typeof r == "function")
        c = r.call(t, a, c);
      else if (Array.isArray(r) && !r.includes(a))
        return;
      (c !== void 0 || i) && o.items.push(rt(a, c, n));
    };
    if (t instanceof Map)
      for (const [a, c] of t)
        l(a, c);
    else if (t && typeof t == "object")
      for (const a of Object.keys(t))
        l(a, t[a]);
    return typeof e.sortMapEntries == "function" && o.items.sort(e.sortMapEntries), o;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(e, t) {
    var o;
    let n;
    L(e) ? n = e : !e || typeof e != "object" || !("key" in e) ? n = new B(e, e == null ? void 0 : e.value) : n = new B(e.key, e.value);
    const i = Q(this.items, n.key), r = (o = this.schema) == null ? void 0 : o.sortMapEntries;
    if (i) {
      if (!t)
        throw new Error(`Key ${n.key} already set`);
      A(i.value) && Bt(n.value) ? i.value.value = n.value : i.value = n.value;
    } else if (r) {
      const l = this.items.findIndex((a) => r(n, a) < 0);
      l === -1 ? this.items.push(n) : this.items.splice(l, 0, n);
    } else
      this.items.push(n);
  }
  delete(e) {
    const t = Q(this.items, e);
    return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
  }
  get(e, t) {
    const n = Q(this.items, e), i = n == null ? void 0 : n.value;
    return (!t && A(i) ? i.value : i) ?? void 0;
  }
  has(e) {
    return !!Q(this.items, e);
  }
  set(e, t) {
    this.add(new B(e, t), !0);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(e, t, n) {
    const i = n ? new n() : t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    t != null && t.onCreate && t.onCreate(i);
    for (const r of this.items)
      jt(t, i, r);
    return i;
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    for (const i of this.items)
      if (!L(i))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);
    return !e.allNullValues && this.hasAllNullValues(!1) && (e = Object.assign({}, e, { allNullValues: !0 })), qt(this, e, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: e.indent || "",
      onChompKeep: n,
      onComment: t
    });
  }
}
const ce = {
  collection: "map",
  default: !0,
  nodeClass: M,
  tag: "tag:yaml.org,2002:map",
  resolve(s, e) {
    return we(s) || e("Expected a mapping for this tag"), s;
  },
  createNode: (s, e, t) => M.from(s, e, t)
};
class X extends nt {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(e) {
    super(le, e), this.items = [];
  }
  add(e) {
    this.items.push(e);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    const t = Oe(e);
    return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
  }
  get(e, t) {
    const n = Oe(e);
    if (typeof n != "number")
      return;
    const i = this.items[n];
    return !t && A(i) ? i.value : i;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(e) {
    const t = Oe(e);
    return typeof t == "number" && t < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(e, t) {
    const n = Oe(e);
    if (typeof n != "number")
      throw new Error(`Expected a valid index, not ${e}.`);
    const i = this.items[n];
    A(i) && Bt(t) ? i.value = t : this.items[n] = t;
  }
  toJSON(e, t) {
    const n = [];
    t != null && t.onCreate && t.onCreate(n);
    let i = 0;
    for (const r of this.items)
      n.push(P(r, String(i++), t));
    return n;
  }
  toString(e, t, n) {
    return e ? qt(this, e, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (e.indent || "") + "  ",
      onChompKeep: n,
      onComment: t
    }) : JSON.stringify(this);
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t)) {
      let o = 0;
      for (let l of t) {
        if (typeof i == "function") {
          const a = t instanceof Set ? l : String(o++);
          l = i.call(t, a, l);
        }
        r.items.push(ye(l, void 0, n));
      }
    }
    return r;
  }
}
function Oe(s) {
  let e = A(s) ? s.value : s;
  return e && typeof e == "string" && (e = Number(e)), typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : null;
}
const fe = {
  collection: "seq",
  default: !0,
  nodeClass: X,
  tag: "tag:yaml.org,2002:seq",
  resolve(s, e) {
    return ke(s) || e("Expected a sequence for this tag"), s;
  },
  createNode: (s, e, t) => X.from(s, e, t)
}, Me = {
  identify: (s) => typeof s == "string",
  default: !0,
  tag: "tag:yaml.org,2002:str",
  resolve: (s) => s,
  stringify(s, e, t, n) {
    return e = Object.assign({ actualString: !0 }, e), it(s, e, t, n);
  }
}, Pe = {
  identify: (s) => s == null,
  createNode: () => new N(null),
  default: !0,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new N(null),
  stringify: ({ source: s }, e) => typeof s == "string" && Pe.test.test(s) ? s : e.options.nullStr
}, ot = {
  identify: (s) => typeof s == "boolean",
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (s) => new N(s[0] === "t" || s[0] === "T"),
  stringify({ source: s, value: e }, t) {
    if (s && ot.test.test(s)) {
      const n = s[0] === "t" || s[0] === "T";
      if (e === n)
        return s;
    }
    return e ? t.options.trueStr : t.options.falseStr;
  }
};
function R({ format: s, minFractionDigits: e, tag: t, value: n }) {
  if (typeof n == "bigint")
    return String(n);
  const i = typeof n == "number" ? n : Number(n);
  if (!isFinite(i))
    return isNaN(i) ? ".nan" : i < 0 ? "-.inf" : ".inf";
  let r = JSON.stringify(n);
  if (!s && e && (!t || t === "tag:yaml.org,2002:float") && /^\d/.test(r)) {
    let o = r.indexOf(".");
    o < 0 && (o = r.length, r += ".");
    let l = e - (r.length - o - 1);
    for (; l-- > 0; )
      r += "0";
  }
  return r;
}
const Kt = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: R
}, Rt = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : R(s);
  }
}, Ft = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(s) {
    const e = new N(parseFloat(s)), t = s.indexOf(".");
    return t !== -1 && s[s.length - 1] === "0" && (e.minFractionDigits = s.length - t - 1), e;
  },
  stringify: R
}, je = (s) => typeof s == "bigint" || Number.isInteger(s), lt = (s, e, t, { intAsBigInt: n }) => n ? BigInt(s) : parseInt(s.substring(e), t);
function Ut(s, e, t) {
  const { value: n } = s;
  return je(n) && n >= 0 ? t + n.toString(e) : R(s);
}
const Vt = {
  identify: (s) => je(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (s, e, t) => lt(s, 2, 8, t),
  stringify: (s) => Ut(s, 8, "0o")
}, Jt = {
  identify: je,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (s, e, t) => lt(s, 0, 10, t),
  stringify: R
}, Yt = {
  identify: (s) => je(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (s, e, t) => lt(s, 2, 16, t),
  stringify: (s) => Ut(s, 16, "0x")
}, $s = [
  ce,
  fe,
  Me,
  Pe,
  ot,
  Vt,
  Jt,
  Yt,
  Kt,
  Rt,
  Ft
];
function bt(s) {
  return typeof s == "bigint" || Number.isInteger(s);
}
const Ae = ({ value: s }) => JSON.stringify(s), _s = [
  {
    identify: (s) => typeof s == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (s) => s,
    stringify: Ae
  },
  {
    identify: (s) => s == null,
    createNode: () => new N(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: Ae
  },
  {
    identify: (s) => typeof s == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^true|false$/,
    resolve: (s) => s === "true",
    stringify: Ae
  },
  {
    identify: bt,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (s, e, { intAsBigInt: t }) => t ? BigInt(s) : parseInt(s, 10),
    stringify: ({ value: s }) => bt(s) ? s.toString() : JSON.stringify(s)
  },
  {
    identify: (s) => typeof s == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (s) => parseFloat(s),
    stringify: Ae
  }
], Cs = {
  default: !0,
  tag: "",
  test: /^/,
  resolve(s, e) {
    return e(`Unresolved plain scalar ${JSON.stringify(s)}`), s;
  }
}, vs = [ce, fe].concat(_s, Cs), at = {
  identify: (s) => s instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: !1,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(s, e) {
    if (typeof Buffer == "function")
      return Buffer.from(s, "base64");
    if (typeof atob == "function") {
      const t = atob(s.replace(/[\n\r]/g, "")), n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; ++i)
        n[i] = t.charCodeAt(i);
      return n;
    } else
      return e("This environment does not support reading binary tags; either Buffer or atob is required"), s;
  },
  stringify({ comment: s, type: e, value: t }, n, i, r) {
    const o = t;
    let l;
    if (typeof Buffer == "function")
      l = o instanceof Buffer ? o.toString("base64") : Buffer.from(o.buffer).toString("base64");
    else if (typeof btoa == "function") {
      let a = "";
      for (let c = 0; c < o.length; ++c)
        a += String.fromCharCode(o[c]);
      l = btoa(a);
    } else
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    if (e || (e = N.BLOCK_LITERAL), e !== N.QUOTE_DOUBLE) {
      const a = Math.max(n.options.lineWidth - n.indent.length, n.options.minContentWidth), c = Math.ceil(l.length / a), d = new Array(c);
      for (let f = 0, u = 0; f < c; ++f, u += a)
        d[f] = l.substr(u, a);
      l = d.join(e === N.BLOCK_LITERAL ? `
` : " ");
    }
    return it({ comment: s, type: e, value: l }, n, i, r);
  }
};
function Gt(s, e) {
  if (ke(s))
    for (let t = 0; t < s.items.length; ++t) {
      let n = s.items[t];
      if (!L(n)) {
        if (we(n)) {
          n.items.length > 1 && e("Each pair must have its own sequence indicator");
          const i = n.items[0] || new B(new N(null));
          if (n.commentBefore && (i.key.commentBefore = i.key.commentBefore ? `${n.commentBefore}
${i.key.commentBefore}` : n.commentBefore), n.comment) {
            const r = i.value ?? i.key;
            r.comment = r.comment ? `${n.comment}
${r.comment}` : n.comment;
          }
          n = i;
        }
        s.items[t] = L(n) ? n : new B(n);
      }
    }
  else
    e("Expected a sequence for this tag");
  return s;
}
function Wt(s, e, t) {
  const { replacer: n } = t, i = new X(s);
  i.tag = "tag:yaml.org,2002:pairs";
  let r = 0;
  if (e && Symbol.iterator in Object(e))
    for (let o of e) {
      typeof n == "function" && (o = n.call(e, String(r++), o));
      let l, a;
      if (Array.isArray(o))
        if (o.length === 2)
          l = o[0], a = o[1];
        else
          throw new TypeError(`Expected [key, value] tuple: ${o}`);
      else if (o && o instanceof Object) {
        const c = Object.keys(o);
        if (c.length === 1)
          l = c[0], a = o[l];
        else
          throw new TypeError(`Expected tuple with one key, not ${c.length} keys`);
      } else
        l = o;
      i.items.push(rt(l, a, t));
    }
  return i;
}
const ct = {
  collection: "seq",
  default: !1,
  tag: "tag:yaml.org,2002:pairs",
  resolve: Gt,
  createNode: Wt
};
class ne extends X {
  constructor() {
    super(), this.add = M.prototype.add.bind(this), this.delete = M.prototype.delete.bind(this), this.get = M.prototype.get.bind(this), this.has = M.prototype.has.bind(this), this.set = M.prototype.set.bind(this), this.tag = ne.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(e, t) {
    if (!t)
      return super.toJSON(e);
    const n = /* @__PURE__ */ new Map();
    t != null && t.onCreate && t.onCreate(n);
    for (const i of this.items) {
      let r, o;
      if (L(i) ? (r = P(i.key, "", t), o = P(i.value, r, t)) : r = P(i, "", t), n.has(r))
        throw new Error("Ordered maps must not include duplicate keys");
      n.set(r, o);
    }
    return n;
  }
  static from(e, t, n) {
    const i = Wt(e, t, n), r = new this();
    return r.items = i.items, r;
  }
}
ne.tag = "tag:yaml.org,2002:omap";
const ft = {
  collection: "seq",
  identify: (s) => s instanceof Map,
  nodeClass: ne,
  default: !1,
  tag: "tag:yaml.org,2002:omap",
  resolve(s, e) {
    const t = Gt(s, e), n = [];
    for (const { key: i } of t.items)
      A(i) && (n.includes(i.value) ? e(`Ordered maps must not include duplicate keys: ${i.value}`) : n.push(i.value));
    return Object.assign(new ne(), t);
  },
  createNode: (s, e, t) => ne.from(s, e, t)
};
function Qt({ value: s, source: e }, t) {
  return e && (s ? Ht : Xt).test.test(e) ? e : s ? t.options.trueStr : t.options.falseStr;
}
const Ht = {
  identify: (s) => s === !0,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new N(!0),
  stringify: Qt
}, Xt = {
  identify: (s) => s === !1,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new N(!1),
  stringify: Qt
}, Bs = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: R
}, Ds = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s.replace(/_/g, "")),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : R(s);
  }
}, Ms = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(s) {
    const e = new N(parseFloat(s.replace(/_/g, ""))), t = s.indexOf(".");
    if (t !== -1) {
      const n = s.substring(t + 1).replace(/_/g, "");
      n[n.length - 1] === "0" && (e.minFractionDigits = n.length);
    }
    return e;
  },
  stringify: R
}, Se = (s) => typeof s == "bigint" || Number.isInteger(s);
function qe(s, e, t, { intAsBigInt: n }) {
  const i = s[0];
  if ((i === "-" || i === "+") && (e += 1), s = s.substring(e).replace(/_/g, ""), n) {
    switch (t) {
      case 2:
        s = `0b${s}`;
        break;
      case 8:
        s = `0o${s}`;
        break;
      case 16:
        s = `0x${s}`;
        break;
    }
    const o = BigInt(s);
    return i === "-" ? BigInt(-1) * o : o;
  }
  const r = parseInt(s, t);
  return i === "-" ? -1 * r : r;
}
function ut(s, e, t) {
  const { value: n } = s;
  if (Se(n)) {
    const i = n.toString(e);
    return n < 0 ? "-" + t + i.substr(1) : t + i;
  }
  return R(s);
}
const Ps = {
  identify: Se,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (s, e, t) => qe(s, 2, 2, t),
  stringify: (s) => ut(s, 2, "0b")
}, js = {
  identify: Se,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (s, e, t) => qe(s, 1, 8, t),
  stringify: (s) => ut(s, 8, "0")
}, qs = {
  identify: Se,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (s, e, t) => qe(s, 0, 10, t),
  stringify: R
}, Ks = {
  identify: Se,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (s, e, t) => qe(s, 2, 16, t),
  stringify: (s) => ut(s, 16, "0x")
};
class ie extends M {
  constructor(e) {
    super(e), this.tag = ie.tag;
  }
  add(e) {
    let t;
    L(e) ? t = e : e && typeof e == "object" && "key" in e && "value" in e && e.value === null ? t = new B(e.key, null) : t = new B(e, null), Q(this.items, t.key) || this.items.push(t);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(e, t) {
    const n = Q(this.items, e);
    return !t && L(n) ? A(n.key) ? n.key.value : n.key : n;
  }
  set(e, t) {
    if (typeof t != "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);
    const n = Q(this.items, e);
    n && !t ? this.items.splice(this.items.indexOf(n), 1) : !n && t && this.items.push(new B(e));
  }
  toJSON(e, t) {
    return super.toJSON(e, t, Set);
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    if (this.hasAllNullValues(!0))
      return super.toString(Object.assign({}, e, { allNullValues: !0 }), t, n);
    throw new Error("Set items must all have null values");
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t))
      for (let o of t)
        typeof i == "function" && (o = i.call(t, o, o)), r.items.push(rt(o, null, n));
    return r;
  }
}
ie.tag = "tag:yaml.org,2002:set";
const ht = {
  collection: "map",
  identify: (s) => s instanceof Set,
  nodeClass: ie,
  default: !1,
  tag: "tag:yaml.org,2002:set",
  createNode: (s, e, t) => ie.from(s, e, t),
  resolve(s, e) {
    if (we(s)) {
      if (s.hasAllNullValues(!0))
        return Object.assign(new ie(), s);
      e("Set items must all have null values");
    } else
      e("Expected a mapping for this tag");
    return s;
  }
};
function dt(s, e) {
  const t = s[0], n = t === "-" || t === "+" ? s.substring(1) : s, i = (o) => e ? BigInt(o) : Number(o), r = n.replace(/_/g, "").split(":").reduce((o, l) => o * i(60) + i(l), i(0));
  return t === "-" ? i(-1) * r : r;
}
function Zt(s) {
  let { value: e } = s, t = (o) => o;
  if (typeof e == "bigint")
    t = (o) => BigInt(o);
  else if (isNaN(e) || !isFinite(e))
    return R(s);
  let n = "";
  e < 0 && (n = "-", e *= t(-1));
  const i = t(60), r = [e % i];
  return e < 60 ? r.unshift(0) : (e = (e - r[0]) / i, r.unshift(e % i), e >= 60 && (e = (e - r[0]) / i, r.unshift(e))), n + r.map((o) => String(o).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const zt = {
  identify: (s) => typeof s == "bigint" || Number.isInteger(s),
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (s, e, { intAsBigInt: t }) => dt(s, t),
  stringify: Zt
}, xt = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (s) => dt(s, !1),
  stringify: Zt
}, Ke = {
  identify: (s) => s instanceof Date,
  default: !0,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(s) {
    const e = s.match(Ke.test);
    if (!e)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, t, n, i, r, o, l] = e.map(Number), a = e[7] ? Number((e[7] + "00").substr(1, 3)) : 0;
    let c = Date.UTC(t, n - 1, i, r || 0, o || 0, l || 0, a);
    const d = e[8];
    if (d && d !== "Z") {
      let f = dt(d, !1);
      Math.abs(f) < 30 && (f *= 60), c -= 6e4 * f;
    }
    return new Date(c);
  },
  stringify: ({ value: s }) => s.toISOString().replace(/((T00:00)?:00)?\.000Z$/, "")
}, wt = [
  ce,
  fe,
  Me,
  Pe,
  Ht,
  Xt,
  Ps,
  js,
  qs,
  Ks,
  Bs,
  Ds,
  Ms,
  at,
  ft,
  ct,
  ht,
  zt,
  xt,
  Ke
], kt = /* @__PURE__ */ new Map([
  ["core", $s],
  ["failsafe", [ce, fe, Me]],
  ["json", vs],
  ["yaml11", wt],
  ["yaml-1.1", wt]
]), St = {
  binary: at,
  bool: ot,
  float: Ft,
  floatExp: Rt,
  floatNaN: Kt,
  floatTime: xt,
  int: Jt,
  intHex: Yt,
  intOct: Vt,
  intTime: zt,
  map: ce,
  null: Pe,
  omap: ft,
  pairs: ct,
  seq: fe,
  set: ht,
  timestamp: Ke
}, Rs = {
  "tag:yaml.org,2002:binary": at,
  "tag:yaml.org,2002:omap": ft,
  "tag:yaml.org,2002:pairs": ct,
  "tag:yaml.org,2002:set": ht,
  "tag:yaml.org,2002:timestamp": Ke
};
function Ue(s, e) {
  let t = kt.get(e);
  if (!t)
    if (Array.isArray(s))
      t = [];
    else {
      const n = Array.from(kt.keys()).filter((i) => i !== "yaml11").map((i) => JSON.stringify(i)).join(", ");
      throw new Error(`Unknown schema "${e}"; use one of ${n} or define customTags array`);
    }
  if (Array.isArray(s))
    for (const n of s)
      t = t.concat(n);
  else
    typeof s == "function" && (t = s(t.slice()));
  return t.map((n) => {
    if (typeof n != "string")
      return n;
    const i = St[n];
    if (i)
      return i;
    const r = Object.keys(St).map((o) => JSON.stringify(o)).join(", ");
    throw new Error(`Unknown custom tag "${n}"; use one of ${r}`);
  });
}
const Fs = (s, e) => s.key < e.key ? -1 : s.key > e.key ? 1 : 0;
class pt {
  constructor({ compat: e, customTags: t, merge: n, resolveKnownTags: i, schema: r, sortMapEntries: o, toStringDefaults: l }) {
    this.compat = Array.isArray(e) ? Ue(e, "compat") : e ? Ue(null, e) : null, this.merge = !!n, this.name = typeof r == "string" && r || "core", this.knownTags = i ? Rs : {}, this.tags = Ue(t, this.name), this.toStringOptions = l ?? null, Object.defineProperty(this, V, { value: ce }), Object.defineProperty(this, U, { value: Me }), Object.defineProperty(this, le, { value: fe }), this.sortMapEntries = typeof o == "function" ? o : o === !0 ? Fs : null;
  }
  clone() {
    const e = Object.create(pt.prototype, Object.getOwnPropertyDescriptors(this));
    return e.tags = this.tags.slice(), e;
  }
}
function Us(s, e) {
  var a;
  const t = [];
  let n = e.directives === !0;
  if (e.directives !== !1 && s.directives) {
    const c = s.directives.toString(s);
    c ? (t.push(c), n = !0) : s.directives.docStart && (n = !0);
  }
  n && t.push("---");
  const i = Mt(s, e), { commentString: r } = i.options;
  if (s.commentBefore) {
    t.length !== 1 && t.unshift("");
    const c = r(s.commentBefore);
    t.unshift(F(c, ""));
  }
  let o = !1, l = null;
  if (s.contents) {
    if ($(s.contents)) {
      if (s.contents.spaceBefore && n && t.push(""), s.contents.commentBefore) {
        const f = r(s.contents.commentBefore);
        t.push(F(f, ""));
      }
      i.forceBlockIndent = !!s.comment, l = s.contents.comment;
    }
    const c = l ? void 0 : () => o = !0;
    let d = re(s.contents, i, () => l = null, c);
    l && (d += W(d, "", r(l))), (d[0] === "|" || d[0] === ">") && t[t.length - 1] === "---" ? t[t.length - 1] = `--- ${d}` : t.push(d);
  } else
    t.push(re(s.contents, i));
  if ((a = s.directives) != null && a.docEnd)
    if (s.comment) {
      const c = r(s.comment);
      c.includes(`
`) ? (t.push("..."), t.push(F(c, ""))) : t.push(`... ${c}`);
    } else
      t.push("...");
  else {
    let c = s.comment;
    c && o && (c = c.replace(/^\n+/, "")), c && ((!o || l) && t[t.length - 1] !== "" && t.push(""), t.push(F(r(c), "")));
  }
  return t.join(`
`) + `
`;
}
class Re {
  constructor(e, t, n) {
    this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, q, { value: Qe });
    let i = null;
    typeof t == "function" || Array.isArray(t) ? i = t : n === void 0 && t && (n = t, t = void 0);
    const r = Object.assign({
      intAsBigInt: !1,
      keepSourceTokens: !1,
      logLevel: "warn",
      prettyErrors: !0,
      strict: !0,
      uniqueKeys: !0,
      version: "1.2"
    }, n);
    this.options = r;
    let { version: o } = r;
    n != null && n._directives ? (this.directives = n._directives.atDocument(), this.directives.yaml.explicit && (o = this.directives.yaml.version)) : this.directives = new v({ version: o }), this.setSchema(o, n), this.contents = e === void 0 ? null : this.createNode(e, i, n);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const e = Object.create(Re.prototype, {
      [q]: { value: Qe }
    });
    return e.commentBefore = this.commentBefore, e.comment = this.comment, e.errors = this.errors.slice(), e.warnings = this.warnings.slice(), e.options = Object.assign({}, this.options), this.directives && (e.directives = this.directives.clone()), e.schema = this.schema.clone(), e.contents = $(this.contents) ? this.contents.clone(e.schema) : this.contents, this.range && (e.range = this.range.slice()), e;
  }
  /** Adds a value to the document. */
  add(e) {
    z(this.contents) && this.contents.add(e);
  }
  /** Adds a value to the document. */
  addIn(e, t) {
    z(this.contents) && this.contents.addIn(e, t);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(e, t) {
    if (!e.anchor) {
      const n = Ct(this);
      e.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !t || n.has(t) ? vt(t || "a", n) : t;
    }
    return new st(e.anchor);
  }
  createNode(e, t, n) {
    let i;
    if (typeof t == "function")
      e = t.call({ "": e }, "", e), i = t;
    else if (Array.isArray(t)) {
      const p = (w) => typeof w == "number" || w instanceof String || w instanceof Number, b = t.filter(p).map(String);
      b.length > 0 && (t = t.concat(b)), i = t;
    } else
      n === void 0 && t && (n = t, t = void 0);
    const { aliasDuplicateObjects: r, anchorPrefix: o, flow: l, keepUndefined: a, onTagObj: c, tag: d } = n ?? {}, { onAnchor: f, setAnchors: u, sourceObjects: m } = gs(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      o || "a"
    ), y = {
      aliasDuplicateObjects: r ?? !0,
      keepUndefined: a ?? !1,
      onAnchor: f,
      onTagObj: c,
      replacer: i,
      schema: this.schema,
      sourceObjects: m
    }, h = ye(e, d, y);
    return l && E(h) && (h.flow = !0), u(), h;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(e, t, n = {}) {
    const i = this.createNode(e, null, n), r = this.createNode(t, null, n);
    return new B(i, r);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    return z(this.contents) ? this.contents.delete(e) : !1;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    return de(e) ? this.contents == null ? !1 : (this.contents = null, !0) : z(this.contents) ? this.contents.deleteIn(e) : !1;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(e, t) {
    return E(this.contents) ? this.contents.get(e, t) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    return de(e) ? !t && A(this.contents) ? this.contents.value : this.contents : E(this.contents) ? this.contents.getIn(e, t) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(e) {
    return E(this.contents) ? this.contents.has(e) : !1;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(e) {
    return de(e) ? this.contents !== void 0 : E(this.contents) ? this.contents.hasIn(e) : !1;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(e, t) {
    this.contents == null ? this.contents = $e(this.schema, [e], t) : z(this.contents) && this.contents.set(e, t);
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    de(e) ? this.contents = t : this.contents == null ? this.contents = $e(this.schema, Array.from(e), t) : z(this.contents) && this.contents.setIn(e, t);
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(e, t = {}) {
    typeof e == "number" && (e = String(e));
    let n;
    switch (e) {
      case "1.1":
        this.directives ? this.directives.yaml.version = "1.1" : this.directives = new v({ version: "1.1" }), n = { merge: !0, resolveKnownTags: !1, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        this.directives ? this.directives.yaml.version = e : this.directives = new v({ version: e }), n = { merge: !1, resolveKnownTags: !0, schema: "core" };
        break;
      case null:
        this.directives && delete this.directives, n = null;
        break;
      default: {
        const i = JSON.stringify(e);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`);
      }
    }
    if (t.schema instanceof Object)
      this.schema = t.schema;
    else if (n)
      this.schema = new pt(Object.assign(n, t));
    else
      throw new Error("With a null YAML version, the { schema: Schema } option is required");
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json: e, jsonArg: t, mapAsMap: n, maxAliasCount: i, onAnchor: r, reviver: o } = {}) {
    const l = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !e,
      mapAsMap: n === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof i == "number" ? i : 100
    }, a = P(this.contents, t ?? "", l);
    if (typeof r == "function")
      for (const { count: c, res: d } of l.anchors.values())
        r(d, c);
    return typeof o == "function" ? te(o, { "": a }, "", a) : a;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(e, t) {
    return this.toJS({ json: !0, jsonArg: e, mapAsMap: !1, onAnchor: t });
  }
  /** A YAML representation of the document. */
  toString(e = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in e && (!Number.isInteger(e.indent) || Number(e.indent) <= 0)) {
      const t = JSON.stringify(e.indent);
      throw new Error(`"indent" option must be a positive integer, not ${t}`);
    }
    return Us(this, e);
  }
}
function z(s) {
  if (E(s))
    return !0;
  throw new Error("Expected a YAML collection as document contents");
}
class es extends Error {
  constructor(e, t, n, i) {
    super(), this.name = e, this.code = n, this.message = i, this.pos = t;
  }
}
class pe extends es {
  constructor(e, t, n) {
    super("YAMLParseError", e, t, n);
  }
}
class Vs extends es {
  constructor(e, t, n) {
    super("YAMLWarning", e, t, n);
  }
}
const Nt = (s, e) => (t) => {
  if (t.pos[0] === -1)
    return;
  t.linePos = t.pos.map((l) => e.linePos(l));
  const { line: n, col: i } = t.linePos[0];
  t.message += ` at line ${n}, column ${i}`;
  let r = i - 1, o = s.substring(e.lineStarts[n - 1], e.lineStarts[n]).replace(/[\n\r]+$/, "");
  if (r >= 60 && o.length > 80) {
    const l = Math.min(r - 39, o.length - 79);
    o = "…" + o.substring(l), r -= l - 1;
  }
  if (o.length > 80 && (o = o.substring(0, 79) + "…"), n > 1 && /^ *$/.test(o.substring(0, r))) {
    let l = s.substring(e.lineStarts[n - 2], e.lineStarts[n - 1]);
    l.length > 80 && (l = l.substring(0, 79) + `…
`), o = l + o;
  }
  if (/[^ ]/.test(o)) {
    let l = 1;
    const a = t.linePos[1];
    a && a.line === n && a.col > i && (l = Math.max(1, Math.min(a.col - i, 80 - r)));
    const c = " ".repeat(r) + "^".repeat(l);
    t.message += `:

${o}
${c}
`;
  }
};
function oe(s, { flow: e, indicator: t, next: n, offset: i, onError: r, startOnNewline: o }) {
  let l = !1, a = o, c = o, d = "", f = "", u = !1, m = !1, y = !1, h = null, p = null, b = null, w = null, S = null;
  for (const g of s)
    switch (y && (g.type !== "space" && g.type !== "newline" && g.type !== "comma" && r(g.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), y = !1), g.type) {
      case "space":
        !e && a && t !== "doc-start" && g.source[0] === "	" && r(g, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), c = !0;
        break;
      case "comment": {
        c || r(g, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const I = g.source.substring(1) || " ";
        d ? d += f + I : d = I, f = "", a = !1;
        break;
      }
      case "newline":
        a ? d ? d += g.source : l = !0 : f += g.source, a = !0, u = !0, (h || p) && (m = !0), c = !0;
        break;
      case "anchor":
        h && r(g, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), g.source.endsWith(":") && r(g.offset + g.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), h = g, S === null && (S = g.offset), a = !1, c = !1, y = !0;
        break;
      case "tag": {
        p && r(g, "MULTIPLE_TAGS", "A node can have at most one tag"), p = g, S === null && (S = g.offset), a = !1, c = !1, y = !0;
        break;
      }
      case t:
        (h || p) && r(g, "BAD_PROP_ORDER", `Anchors and tags must be after the ${g.source} indicator`), w && r(g, "UNEXPECTED_TOKEN", `Unexpected ${g.source} in ${e ?? "collection"}`), w = g, a = !1, c = !1;
        break;
      case "comma":
        if (e) {
          b && r(g, "UNEXPECTED_TOKEN", `Unexpected , in ${e}`), b = g, a = !1, c = !1;
          break;
        }
      default:
        r(g, "UNEXPECTED_TOKEN", `Unexpected ${g.type} token`), a = !1, c = !1;
    }
  const k = s[s.length - 1], O = k ? k.offset + k.source.length : i;
  return y && n && n.type !== "space" && n.type !== "newline" && n.type !== "comma" && (n.type !== "scalar" || n.source !== "") && r(n.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), {
    comma: b,
    found: w,
    spaceBefore: l,
    comment: d,
    hasNewline: u,
    hasNewlineAfterProp: m,
    anchor: h,
    tag: p,
    end: O,
    start: S ?? O
  };
}
function be(s) {
  if (!s)
    return null;
  switch (s.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (s.source.includes(`
`))
        return !0;
      if (s.end) {
        for (const e of s.end)
          if (e.type === "newline")
            return !0;
      }
      return !1;
    case "flow-collection":
      for (const e of s.items) {
        for (const t of e.start)
          if (t.type === "newline")
            return !0;
        if (e.sep) {
          for (const t of e.sep)
            if (t.type === "newline")
              return !0;
        }
        if (be(e.key) || be(e.value))
          return !0;
      }
      return !1;
    default:
      return !0;
  }
}
function ze(s, e, t) {
  if ((e == null ? void 0 : e.type) === "flow-collection") {
    const n = e.end[0];
    n.indent === s && (n.source === "]" || n.source === "}") && be(e) && t(n, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
  }
}
function ts(s, e, t) {
  const { uniqueKeys: n } = s.options;
  if (n === !1)
    return !1;
  const i = typeof n == "function" ? n : (r, o) => r === o || A(r) && A(o) && r.value === o.value && !(r.value === "<<" && s.schema.merge);
  return e.some((r) => i(r.key, t));
}
const Ot = "All mapping items must start at the same column";
function Js({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  var d;
  const o = (r == null ? void 0 : r.nodeClass) ?? M, l = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let a = n.offset, c = null;
  for (const f of n.items) {
    const { start: u, key: m, sep: y, value: h } = f, p = oe(u, {
      indicator: "explicit-key-ind",
      next: m ?? (y == null ? void 0 : y[0]),
      offset: a,
      onError: i,
      startOnNewline: !0
    }), b = !p.found;
    if (b) {
      if (m && (m.type === "block-seq" ? i(a, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in m && m.indent !== n.indent && i(a, "BAD_INDENT", Ot)), !p.anchor && !p.tag && !y) {
        c = p.end, p.comment && (l.comment ? l.comment += `
` + p.comment : l.comment = p.comment);
        continue;
      }
      (p.hasNewlineAfterProp || be(m)) && i(m ?? u[u.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
    } else
      ((d = p.found) == null ? void 0 : d.indent) !== n.indent && i(a, "BAD_INDENT", Ot);
    const w = p.end, S = m ? s(t, m, p, i) : e(t, w, u, null, p, i);
    t.schema.compat && ze(n.indent, m, i), ts(t, l.items, S) && i(w, "DUPLICATE_KEY", "Map keys must be unique");
    const k = oe(y ?? [], {
      indicator: "map-value-ind",
      next: h,
      offset: S.range[2],
      onError: i,
      startOnNewline: !m || m.type === "block-scalar"
    });
    if (a = k.end, k.found) {
      b && ((h == null ? void 0 : h.type) === "block-map" && !k.hasNewline && i(a, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), t.options.strict && p.start < k.found.offset - 1024 && i(S.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
      const O = h ? s(t, h, k, i) : e(t, a, y, null, k, i);
      t.schema.compat && ze(n.indent, h, i), a = O.range[2];
      const g = new B(S, O);
      t.options.keepSourceTokens && (g.srcToken = f), l.items.push(g);
    } else {
      b && i(S.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), k.comment && (S.comment ? S.comment += `
` + k.comment : S.comment = k.comment);
      const O = new B(S);
      t.options.keepSourceTokens && (O.srcToken = f), l.items.push(O);
    }
  }
  return c && c < a && i(c, "IMPOSSIBLE", "Map comment with trailing content"), l.range = [n.offset, a, c ?? a], l;
}
function Ys({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = (r == null ? void 0 : r.nodeClass) ?? X, l = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let a = n.offset, c = null;
  for (const { start: d, value: f } of n.items) {
    const u = oe(d, {
      indicator: "seq-item-ind",
      next: f,
      offset: a,
      onError: i,
      startOnNewline: !0
    });
    if (!u.found)
      if (u.anchor || u.tag || f)
        f && f.type === "block-seq" ? i(u.end, "BAD_INDENT", "All sequence items must start at the same column") : i(a, "MISSING_CHAR", "Sequence item without - indicator");
      else {
        c = u.end, u.comment && (l.comment = u.comment);
        continue;
      }
    const m = f ? s(t, f, u, i) : e(t, u.end, d, null, u, i);
    t.schema.compat && ze(n.indent, f, i), a = m.range[2], l.items.push(m);
  }
  return l.range = [n.offset, a, c ?? a], l;
}
function Ne(s, e, t, n) {
  let i = "";
  if (s) {
    let r = !1, o = "";
    for (const l of s) {
      const { source: a, type: c } = l;
      switch (c) {
        case "space":
          r = !0;
          break;
        case "comment": {
          t && !r && n(l, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const d = a.substring(1) || " ";
          i ? i += o + d : i = d, o = "";
          break;
        }
        case "newline":
          i && (o += a), r = !0;
          break;
        default:
          n(l, "UNEXPECTED_TOKEN", `Unexpected ${c} at node end`);
      }
      e += a.length;
    }
  }
  return { comment: i, offset: e };
}
const Ve = "Block collections are not allowed within flow collections", Je = (s) => s && (s.type === "block-map" || s.type === "block-seq");
function Gs({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = n.start.source === "{", l = o ? "flow map" : "flow sequence", a = (r == null ? void 0 : r.nodeClass) ?? (o ? M : X), c = new a(t.schema);
  c.flow = !0;
  const d = t.atRoot;
  d && (t.atRoot = !1);
  let f = n.offset + n.start.source.length;
  for (let p = 0; p < n.items.length; ++p) {
    const b = n.items[p], { start: w, key: S, sep: k, value: O } = b, g = oe(w, {
      flow: l,
      indicator: "explicit-key-ind",
      next: S ?? (k == null ? void 0 : k[0]),
      offset: f,
      onError: i,
      startOnNewline: !1
    });
    if (!g.found) {
      if (!g.anchor && !g.tag && !k && !O) {
        p === 0 && g.comma ? i(g.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${l}`) : p < n.items.length - 1 && i(g.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${l}`), g.comment && (c.comment ? c.comment += `
` + g.comment : c.comment = g.comment), f = g.end;
        continue;
      }
      !o && t.options.strict && be(S) && i(
        S,
        // checked by containsNewline()
        "MULTILINE_IMPLICIT_KEY",
        "Implicit keys of flow sequence pairs need to be on a single line"
      );
    }
    if (p === 0)
      g.comma && i(g.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${l}`);
    else if (g.comma || i(g.start, "MISSING_CHAR", `Missing , between ${l} items`), g.comment) {
      let I = "";
      e:
        for (const T of w)
          switch (T.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              I = T.source.substring(1);
              break e;
            default:
              break e;
          }
      if (I) {
        let T = c.items[c.items.length - 1];
        L(T) && (T = T.value ?? T.key), T.comment ? T.comment += `
` + I : T.comment = I, g.comment = g.comment.substring(I.length + 1);
      }
    }
    if (!o && !k && !g.found) {
      const I = O ? s(t, O, g, i) : e(t, g.end, k, null, g, i);
      c.items.push(I), f = I.range[2], Je(O) && i(I.range, "BLOCK_IN_FLOW", Ve);
    } else {
      const I = g.end, T = S ? s(t, S, g, i) : e(t, I, w, null, g, i);
      Je(S) && i(T.range, "BLOCK_IN_FLOW", Ve);
      const C = oe(k ?? [], {
        flow: l,
        indicator: "map-value-ind",
        next: O,
        offset: T.range[2],
        onError: i,
        startOnNewline: !1
      });
      if (C.found) {
        if (!o && !g.found && t.options.strict) {
          if (k)
            for (const _ of k) {
              if (_ === C.found)
                break;
              if (_.type === "newline") {
                i(_, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          g.start < C.found.offset - 1024 && i(C.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else
        O && ("source" in O && O.source && O.source[0] === ":" ? i(O, "MISSING_CHAR", `Missing space after : in ${l}`) : i(C.start, "MISSING_CHAR", `Missing , or : between ${l} items`));
      const J = O ? s(t, O, C, i) : C.found ? e(t, C.end, k, null, C, i) : null;
      J ? Je(O) && i(J.range, "BLOCK_IN_FLOW", Ve) : C.comment && (T.comment ? T.comment += `
` + C.comment : T.comment = C.comment);
      const Z = new B(T, J);
      if (t.options.keepSourceTokens && (Z.srcToken = b), o) {
        const _ = c;
        ts(t, _.items, T) && i(I, "DUPLICATE_KEY", "Map keys must be unique"), _.items.push(Z);
      } else {
        const _ = new M(t.schema);
        _.flow = !0, _.items.push(Z), c.items.push(_);
      }
      f = J ? J.range[2] : C.end;
    }
  }
  const u = o ? "}" : "]", [m, ...y] = n.end;
  let h = f;
  if (m && m.source === u)
    h = m.offset + m.source.length;
  else {
    const p = l[0].toUpperCase() + l.substring(1), b = d ? `${p} must end with a ${u}` : `${p} in block collection must be sufficiently indented and end with a ${u}`;
    i(f, d ? "MISSING_CHAR" : "BAD_INDENT", b), m && m.source.length !== 1 && y.unshift(m);
  }
  if (y.length > 0) {
    const p = Ne(y, h, t.options.strict, i);
    p.comment && (c.comment ? c.comment += `
` + p.comment : c.comment = p.comment), c.range = [n.offset, h, p.offset];
  } else
    c.range = [n.offset, h, h];
  return c;
}
function Ye(s, e, t, n, i, r) {
  const o = t.type === "block-map" ? Js(s, e, t, n, r) : t.type === "block-seq" ? Ys(s, e, t, n, r) : Gs(s, e, t, n, r), l = o.constructor;
  return i === "!" || i === l.tagName ? (o.tag = l.tagName, o) : (i && (o.tag = i), o);
}
function Ws(s, e, t, n, i) {
  var f;
  const r = n ? e.directives.tagName(n.source, (u) => i(n, "TAG_RESOLVE_FAILED", u)) : null, o = t.type === "block-map" ? "map" : t.type === "block-seq" ? "seq" : t.start.source === "{" ? "map" : "seq";
  if (!n || !r || r === "!" || r === M.tagName && o === "map" || r === X.tagName && o === "seq" || !o)
    return Ye(s, e, t, i, r);
  let l = e.schema.tags.find((u) => u.tag === r && u.collection === o);
  if (!l) {
    const u = e.schema.knownTags[r];
    if (u && u.collection === o)
      e.schema.tags.push(Object.assign({}, u, { default: !1 })), l = u;
    else
      return u != null && u.collection ? i(n, "BAD_COLLECTION_TYPE", `${u.tag} used for ${o} collection, but expects ${u.collection}`, !0) : i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${r}`, !0), Ye(s, e, t, i, r);
  }
  const a = Ye(s, e, t, i, r, l), c = ((f = l.resolve) == null ? void 0 : f.call(l, a, (u) => i(n, "TAG_RESOLVE_FAILED", u), e.options)) ?? a, d = $(c) ? c : new N(c);
  return d.range = a.range, d.tag = r, l != null && l.format && (d.format = l.format), d;
}
function Qs(s, e, t) {
  const n = s.offset, i = Hs(s, e, t);
  if (!i)
    return { value: "", type: null, comment: "", range: [n, n, n] };
  const r = i.mode === ">" ? N.BLOCK_FOLDED : N.BLOCK_LITERAL, o = s.source ? Xs(s.source) : [];
  let l = o.length;
  for (let h = o.length - 1; h >= 0; --h) {
    const p = o[h][1];
    if (p === "" || p === "\r")
      l = h;
    else
      break;
  }
  if (l === 0) {
    const h = i.chomp === "+" && o.length > 0 ? `
`.repeat(Math.max(1, o.length - 1)) : "";
    let p = n + i.length;
    return s.source && (p += s.source.length), { value: h, type: r, comment: i.comment, range: [n, p, p] };
  }
  let a = s.indent + i.indent, c = s.offset + i.length, d = 0;
  for (let h = 0; h < l; ++h) {
    const [p, b] = o[h];
    if (b === "" || b === "\r")
      i.indent === 0 && p.length > a && (a = p.length);
    else {
      p.length < a && t(c + p.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), i.indent === 0 && (a = p.length), d = h;
      break;
    }
    c += p.length + b.length + 1;
  }
  for (let h = o.length - 1; h >= l; --h)
    o[h][0].length > a && (l = h + 1);
  let f = "", u = "", m = !1;
  for (let h = 0; h < d; ++h)
    f += o[h][0].slice(a) + `
`;
  for (let h = d; h < l; ++h) {
    let [p, b] = o[h];
    c += p.length + b.length + 1;
    const w = b[b.length - 1] === "\r";
    if (w && (b = b.slice(0, -1)), b && p.length < a) {
      const k = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
      t(c - b.length - (w ? 2 : 1), "BAD_INDENT", k), p = "";
    }
    r === N.BLOCK_LITERAL ? (f += u + p.slice(a) + b, u = `
`) : p.length > a || b[0] === "	" ? (u === " " ? u = `
` : !m && u === `
` && (u = `

`), f += u + p.slice(a) + b, u = `
`, m = !0) : b === "" ? u === `
` ? f += `
` : u = `
` : (f += u + b, u = " ", m = !1);
  }
  switch (i.chomp) {
    case "-":
      break;
    case "+":
      for (let h = l; h < o.length; ++h)
        f += `
` + o[h][0].slice(a);
      f[f.length - 1] !== `
` && (f += `
`);
      break;
    default:
      f += `
`;
  }
  const y = n + i.length + s.source.length;
  return { value: f, type: r, comment: i.comment, range: [n, y, y] };
}
function Hs({ offset: s, props: e }, t, n) {
  if (e[0].type !== "block-scalar-header")
    return n(e[0], "IMPOSSIBLE", "Block scalar header not found"), null;
  const { source: i } = e[0], r = i[0];
  let o = 0, l = "", a = -1;
  for (let u = 1; u < i.length; ++u) {
    const m = i[u];
    if (!l && (m === "-" || m === "+"))
      l = m;
    else {
      const y = Number(m);
      !o && y ? o = y : a === -1 && (a = s + u);
    }
  }
  a !== -1 && n(a, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${i}`);
  let c = !1, d = "", f = i.length;
  for (let u = 1; u < e.length; ++u) {
    const m = e[u];
    switch (m.type) {
      case "space":
        c = !0;
      case "newline":
        f += m.source.length;
        break;
      case "comment":
        t && !c && n(m, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), f += m.source.length, d = m.source.substring(1);
        break;
      case "error":
        n(m, "UNEXPECTED_TOKEN", m.message), f += m.source.length;
        break;
      default: {
        const y = `Unexpected token in block scalar header: ${m.type}`;
        n(m, "UNEXPECTED_TOKEN", y);
        const h = m.source;
        h && typeof h == "string" && (f += h.length);
      }
    }
  }
  return { mode: r, indent: o, chomp: l, comment: d, length: f };
}
function Xs(s) {
  const e = s.split(/\n( *)/), t = e[0], n = t.match(/^( *)/), r = [n != null && n[1] ? [n[1], t.slice(n[1].length)] : ["", t]];
  for (let o = 1; o < e.length; o += 2)
    r.push([e[o], e[o + 1]]);
  return r;
}
function Zs(s, e, t) {
  const { offset: n, type: i, source: r, end: o } = s;
  let l, a;
  const c = (u, m, y) => t(n + u, m, y);
  switch (i) {
    case "scalar":
      l = N.PLAIN, a = zs(r, c);
      break;
    case "single-quoted-scalar":
      l = N.QUOTE_SINGLE, a = xs(r, c);
      break;
    case "double-quoted-scalar":
      l = N.QUOTE_DOUBLE, a = en(r, c);
      break;
    default:
      return t(s, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${i}`), {
        value: "",
        type: null,
        comment: "",
        range: [n, n + r.length, n + r.length]
      };
  }
  const d = n + r.length, f = Ne(o, d, e, t);
  return {
    value: a,
    type: l,
    comment: f.comment,
    range: [n, d, f.offset]
  };
}
function zs(s, e) {
  let t = "";
  switch (s[0]) {
    case "	":
      t = "a tab character";
      break;
    case ",":
      t = "flow indicator character ,";
      break;
    case "%":
      t = "directive indicator character %";
      break;
    case "|":
    case ">": {
      t = `block scalar indicator ${s[0]}`;
      break;
    }
    case "@":
    case "`": {
      t = `reserved character ${s[0]}`;
      break;
    }
  }
  return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), ss(s);
}
function xs(s, e) {
  return (s[s.length - 1] !== "'" || s.length === 1) && e(s.length, "MISSING_CHAR", "Missing closing 'quote"), ss(s.slice(1, -1)).replace(/''/g, "'");
}
function ss(s) {
  let e, t;
  try {
    e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
  } catch {
    e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let n = e.exec(s);
  if (!n)
    return s;
  let i = n[1], r = " ", o = e.lastIndex;
  for (t.lastIndex = o; n = t.exec(s); )
    n[1] === "" ? r === `
` ? i += r : r = `
` : (i += r + n[1], r = " "), o = t.lastIndex;
  const l = /[ \t]*(.*)/sy;
  return l.lastIndex = o, n = l.exec(s), i + r + ((n == null ? void 0 : n[1]) ?? "");
}
function en(s, e) {
  let t = "";
  for (let n = 1; n < s.length - 1; ++n) {
    const i = s[n];
    if (!(i === "\r" && s[n + 1] === `
`))
      if (i === `
`) {
        const { fold: r, offset: o } = tn(s, n);
        t += r, n = o;
      } else if (i === "\\") {
        let r = s[++n];
        const o = sn[r];
        if (o)
          t += o;
        else if (r === `
`)
          for (r = s[n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "\r" && s[n + 1] === `
`)
          for (r = s[++n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "x" || r === "u" || r === "U") {
          const l = { x: 2, u: 4, U: 8 }[r];
          t += nn(s, n + 1, l, e), n += l;
        } else {
          const l = s.substr(n - 1, 2);
          e(n - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${l}`), t += l;
        }
      } else if (i === " " || i === "	") {
        const r = n;
        let o = s[n + 1];
        for (; o === " " || o === "	"; )
          o = s[++n + 1];
        o !== `
` && !(o === "\r" && s[n + 2] === `
`) && (t += n > r ? s.slice(r, n + 1) : i);
      } else
        t += i;
  }
  return (s[s.length - 1] !== '"' || s.length === 1) && e(s.length, "MISSING_CHAR", 'Missing closing "quote'), t;
}
function tn(s, e) {
  let t = "", n = s[e + 1];
  for (; (n === " " || n === "	" || n === `
` || n === "\r") && !(n === "\r" && s[e + 2] !== `
`); )
    n === `
` && (t += `
`), e += 1, n = s[e + 1];
  return t || (t = " "), { fold: t, offset: e };
}
const sn = {
  0: "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: `
`,
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "",
  // Unicode next line
  _: " ",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function nn(s, e, t, n) {
  const i = s.substr(e, t), o = i.length === t && /^[0-9a-fA-F]+$/.test(i) ? parseInt(i, 16) : NaN;
  if (isNaN(o)) {
    const l = s.substr(e - 2, t + 2);
    return n(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${l}`), l;
  }
  return String.fromCodePoint(o);
}
function ns(s, e, t, n) {
  const { value: i, type: r, comment: o, range: l } = e.type === "block-scalar" ? Qs(e, s.options.strict, n) : Zs(e, s.options.strict, n), a = t ? s.directives.tagName(t.source, (f) => n(t, "TAG_RESOLVE_FAILED", f)) : null, c = t && a ? rn(s.schema, i, a, t, n) : e.type === "scalar" ? on(s, i, e, n) : s.schema[U];
  let d;
  try {
    const f = c.resolve(i, (u) => n(t ?? e, "TAG_RESOLVE_FAILED", u), s.options);
    d = A(f) ? f : new N(f);
  } catch (f) {
    const u = f instanceof Error ? f.message : String(f);
    n(t ?? e, "TAG_RESOLVE_FAILED", u), d = new N(i);
  }
  return d.range = l, d.source = i, r && (d.type = r), a && (d.tag = a), c.format && (d.format = c.format), o && (d.comment = o), d;
}
function rn(s, e, t, n, i) {
  var l;
  if (t === "!")
    return s[U];
  const r = [];
  for (const a of s.tags)
    if (!a.collection && a.tag === t)
      if (a.default && a.test)
        r.push(a);
      else
        return a;
  for (const a of r)
    if ((l = a.test) != null && l.test(e))
      return a;
  const o = s.knownTags[t];
  return o && !o.collection ? (s.tags.push(Object.assign({}, o, { default: !1, test: void 0 })), o) : (i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${t}`, t !== "tag:yaml.org,2002:str"), s[U]);
}
function on({ directives: s, schema: e }, t, n, i) {
  const r = e.tags.find((o) => {
    var l;
    return o.default && ((l = o.test) == null ? void 0 : l.test(t));
  }) || e[U];
  if (e.compat) {
    const o = e.compat.find((l) => {
      var a;
      return l.default && ((a = l.test) == null ? void 0 : a.test(t));
    }) ?? e[U];
    if (r.tag !== o.tag) {
      const l = s.tagString(r.tag), a = s.tagString(o.tag), c = `Value may be parsed as either ${l} or ${a}`;
      i(n, "TAG_RESOLVE_FAILED", c, !0);
    }
  }
  return r;
}
function ln(s, e, t) {
  if (e) {
    t === null && (t = e.length);
    for (let n = t - 1; n >= 0; --n) {
      let i = e[n];
      switch (i.type) {
        case "space":
        case "comment":
        case "newline":
          s -= i.source.length;
          continue;
      }
      for (i = e[++n]; (i == null ? void 0 : i.type) === "space"; )
        s += i.source.length, i = e[++n];
      break;
    }
  }
  return s;
}
const an = { composeNode: is, composeEmptyNode: mt };
function is(s, e, t, n) {
  const { spaceBefore: i, comment: r, anchor: o, tag: l } = t;
  let a, c = !0;
  switch (e.type) {
    case "alias":
      a = cn(s, e, n), (o || l) && n(e, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      a = ns(s, e, l, n), o && (a.anchor = o.source.substring(1));
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      a = Ws(an, s, e, l, n), o && (a.anchor = o.source.substring(1));
      break;
    default: {
      const d = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
      n(e, "UNEXPECTED_TOKEN", d), a = mt(s, e.offset, void 0, null, t, n), c = !1;
    }
  }
  return o && a.anchor === "" && n(o, "BAD_ALIAS", "Anchor cannot be an empty string"), i && (a.spaceBefore = !0), r && (e.type === "scalar" && e.source === "" ? a.comment = r : a.commentBefore = r), s.options.keepSourceTokens && c && (a.srcToken = e), a;
}
function mt(s, e, t, n, { spaceBefore: i, comment: r, anchor: o, tag: l, end: a }, c) {
  const d = {
    type: "scalar",
    offset: ln(e, t, n),
    indent: -1,
    source: ""
  }, f = ns(s, d, l, c);
  return o && (f.anchor = o.source.substring(1), f.anchor === "" && c(o, "BAD_ALIAS", "Anchor cannot be an empty string")), i && (f.spaceBefore = !0), r && (f.comment = r, f.range[2] = a), f;
}
function cn({ options: s }, { offset: e, source: t, end: n }, i) {
  const r = new st(t.substring(1));
  r.source === "" && i(e, "BAD_ALIAS", "Alias cannot be an empty string"), r.source.endsWith(":") && i(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
  const o = e + t.length, l = Ne(n, o, s.strict, i);
  return r.range = [e, o, l.offset], l.comment && (r.comment = l.comment), r;
}
function fn(s, e, { offset: t, start: n, value: i, end: r }, o) {
  const l = Object.assign({ _directives: e }, s), a = new Re(void 0, l), c = {
    atRoot: !0,
    directives: a.directives,
    options: a.options,
    schema: a.schema
  }, d = oe(n, {
    indicator: "doc-start",
    next: i ?? (r == null ? void 0 : r[0]),
    offset: t,
    onError: o,
    startOnNewline: !0
  });
  d.found && (a.directives.docStart = !0, i && (i.type === "block-map" || i.type === "block-seq") && !d.hasNewline && o(d.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), a.contents = i ? is(c, i, d, o) : mt(c, d.end, n, null, d, o);
  const f = a.contents.range[2], u = Ne(r, f, !1, o);
  return u.comment && (a.comment = u.comment), a.range = [t, f, u.offset], a;
}
function he(s) {
  if (typeof s == "number")
    return [s, s + 1];
  if (Array.isArray(s))
    return s.length === 2 ? s : [s[0], s[1]];
  const { offset: e, source: t } = s;
  return [e, e + (typeof t == "string" ? t.length : 1)];
}
function At(s) {
  var i;
  let e = "", t = !1, n = !1;
  for (let r = 0; r < s.length; ++r) {
    const o = s[r];
    switch (o[0]) {
      case "#":
        e += (e === "" ? "" : n ? `

` : `
`) + (o.substring(1) || " "), t = !0, n = !1;
        break;
      case "%":
        ((i = s[r + 1]) == null ? void 0 : i[0]) !== "#" && (r += 1), t = !1;
        break;
      default:
        t || (n = !0), t = !1;
    }
  }
  return { comment: e, afterEmptyLine: n };
}
class un {
  constructor(e = {}) {
    this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, n, i, r) => {
      const o = he(t);
      r ? this.warnings.push(new Vs(o, n, i)) : this.errors.push(new pe(o, n, i));
    }, this.directives = new v({ version: e.version || "1.2" }), this.options = e;
  }
  decorate(e, t) {
    const { comment: n, afterEmptyLine: i } = At(this.prelude);
    if (n) {
      const r = e.contents;
      if (t)
        e.comment = e.comment ? `${e.comment}
${n}` : n;
      else if (i || e.directives.docStart || !r)
        e.commentBefore = n;
      else if (E(r) && !r.flow && r.items.length > 0) {
        let o = r.items[0];
        L(o) && (o = o.key);
        const l = o.commentBefore;
        o.commentBefore = l ? `${n}
${l}` : n;
      } else {
        const o = r.commentBefore;
        r.commentBefore = o ? `${n}
${o}` : n;
      }
    }
    t ? (Array.prototype.push.apply(e.errors, this.errors), Array.prototype.push.apply(e.warnings, this.warnings)) : (e.errors = this.errors, e.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: At(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(e, t = !1, n = -1) {
    for (const i of e)
      yield* this.next(i);
    yield* this.end(t, n);
  }
  /** Advance the composer by one CST token. */
  *next(e) {
    switch (e.type) {
      case "directive":
        this.directives.add(e.source, (t, n, i) => {
          const r = he(e);
          r[0] += t, this.onError(r, "BAD_DIRECTIVE", n, i);
        }), this.prelude.push(e.source), this.atDirectives = !0;
        break;
      case "document": {
        const t = fn(this.options, this.directives, e, this.onError);
        this.atDirectives && !t.directives.docStart && this.onError(e, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(t, !1), this.doc && (yield this.doc), this.doc = t, this.atDirectives = !1;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(e.source);
        break;
      case "error": {
        const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, n = new pe(he(e), "UNEXPECTED_TOKEN", t);
        this.atDirectives || !this.doc ? this.errors.push(n) : this.doc.errors.push(n);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const n = "Unexpected doc-end without preceding document";
          this.errors.push(new pe(he(e), "UNEXPECTED_TOKEN", n));
          break;
        }
        this.doc.directives.docEnd = !0;
        const t = Ne(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
        if (this.decorate(this.doc, !0), t.comment) {
          const n = this.doc.comment;
          this.doc.comment = n ? `${n}
${t.comment}` : t.comment;
        }
        this.doc.range[2] = t.offset;
        break;
      }
      default:
        this.errors.push(new pe(he(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(e = !1, t = -1) {
    if (this.doc)
      this.decorate(this.doc, !0), yield this.doc, this.doc = null;
    else if (e) {
      const n = Object.assign({ _directives: this.directives }, this.options), i = new Re(void 0, n);
      this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), i.range = [0, t, t], this.decorate(i, !1), yield i;
    }
  }
}
const rs = "\uFEFF", os = "", ls = "", xe = "";
function hn(s) {
  switch (s) {
    case rs:
      return "byte-order-mark";
    case os:
      return "doc-mode";
    case ls:
      return "flow-error-end";
    case xe:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case `
`:
    case `\r
`:
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (s[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
function D(s) {
  switch (s) {
    case void 0:
    case " ":
    case `
`:
    case "\r":
    case "	":
      return !0;
    default:
      return !1;
  }
}
const It = "0123456789ABCDEFabcdef".split(""), dn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split(""), Ge = ",[]{}".split(""), pn = ` ,[]{}
\r	`.split(""), We = (s) => !s || pn.includes(s);
class mn {
  constructor() {
    this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(e, t = !1) {
    e && (this.buffer = this.buffer ? this.buffer + e : e, this.lineEndPos = null), this.atEnd = !t;
    let n = this.next ?? "stream";
    for (; n && (t || this.hasChars(1)); )
      n = yield* this.parseNext(n);
  }
  atLineEnd() {
    let e = this.pos, t = this.buffer[e];
    for (; t === " " || t === "	"; )
      t = this.buffer[++e];
    return !t || t === "#" || t === `
` ? !0 : t === "\r" ? this.buffer[e + 1] === `
` : !1;
  }
  charAt(e) {
    return this.buffer[this.pos + e];
  }
  continueScalar(e) {
    let t = this.buffer[e];
    if (this.indentNext > 0) {
      let n = 0;
      for (; t === " "; )
        t = this.buffer[++n + e];
      if (t === "\r") {
        const i = this.buffer[n + e + 1];
        if (i === `
` || !i && !this.atEnd)
          return e + n + 1;
      }
      return t === `
` || n >= this.indentNext || !t && !this.atEnd ? e + n : -1;
    }
    if (t === "-" || t === ".") {
      const n = this.buffer.substr(e, 3);
      if ((n === "---" || n === "...") && D(this.buffer[e + 3]))
        return -1;
    }
    return e;
  }
  getLine() {
    let e = this.lineEndPos;
    return (typeof e != "number" || e !== -1 && e < this.pos) && (e = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = e), e === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[e - 1] === "\r" && (e -= 1), this.buffer.substring(this.pos, e));
  }
  hasChars(e) {
    return this.pos + e <= this.buffer.length;
  }
  setNext(e) {
    return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = e, null;
  }
  peek(e) {
    return this.buffer.substr(this.pos, e);
  }
  *parseNext(e) {
    switch (e) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let e = this.getLine();
    if (e === null)
      return this.setNext("stream");
    if (e[0] === rs && (yield* this.pushCount(1), e = e.substring(1)), e[0] === "%") {
      let t = e.length;
      const n = e.indexOf("#");
      if (n !== -1) {
        const r = e[n - 1];
        (r === " " || r === "	") && (t = n - 1);
      }
      for (; ; ) {
        const r = e[t - 1];
        if (r === " " || r === "	")
          t -= 1;
        else
          break;
      }
      const i = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
      return yield* this.pushCount(e.length - i), this.pushNewline(), "stream";
    }
    if (this.atLineEnd()) {
      const t = yield* this.pushSpaces(!0);
      return yield* this.pushCount(e.length - t), yield* this.pushNewline(), "stream";
    }
    return yield os, yield* this.parseLineStart();
  }
  *parseLineStart() {
    const e = this.charAt(0);
    if (!e && !this.atEnd)
      return this.setNext("line-start");
    if (e === "-" || e === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const t = this.peek(3);
      if (t === "---" && D(this.charAt(3)))
        return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, "doc";
      if (t === "..." && D(this.charAt(3)))
        return yield* this.pushCount(3), "stream";
    }
    return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !D(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [e, t] = this.peek(2);
    if (!t && !this.atEnd)
      return this.setNext("block-start");
    if ((e === "-" || e === "?" || e === ":") && D(t)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
      return this.indentNext = this.indentValue + 1, this.indentValue += n, yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(!0);
    const e = this.getLine();
    if (e === null)
      return this.setNext("doc");
    let t = yield* this.pushIndicators();
    switch (e[t]) {
      case "#":
        yield* this.pushCount(e.length - t);
      case void 0:
        return yield* this.pushNewline(), yield* this.parseLineStart();
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), "doc";
      case "*":
        return yield* this.pushUntil(We), "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        return t += yield* this.parseBlockScalarHeader(), t += yield* this.pushSpaces(!0), yield* this.pushCount(e.length - t), yield* this.pushNewline(), yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let e, t, n = -1;
    do
      e = yield* this.pushNewline(), e > 0 ? (t = yield* this.pushSpaces(!1), this.indentValue = n = t) : t = 0, t += yield* this.pushSpaces(!0);
    while (e + t > 0);
    const i = this.getLine();
    if (i === null)
      return this.setNext("flow");
    if ((n !== -1 && n < this.indentNext && i[0] !== "#" || n === 0 && (i.startsWith("---") || i.startsWith("...")) && D(i[3])) && !(n === this.indentNext - 1 && this.flowLevel === 1 && (i[0] === "]" || i[0] === "}")))
      return this.flowLevel = 0, yield ls, yield* this.parseLineStart();
    let r = 0;
    for (; i[r] === ","; )
      r += yield* this.pushCount(1), r += yield* this.pushSpaces(!0), this.flowKey = !1;
    switch (r += yield* this.pushIndicators(), i[r]) {
      case void 0:
        return "flow";
      case "#":
        return yield* this.pushCount(i.length - r), "flow";
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
      case "*":
        return yield* this.pushUntil(We), "flow";
      case '"':
      case "'":
        return this.flowKey = !0, yield* this.parseQuotedScalar();
      case ":": {
        const o = this.charAt(1);
        if (this.flowKey || D(o) || o === ",")
          return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
      }
      default:
        return this.flowKey = !1, yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const e = this.charAt(0);
    let t = this.buffer.indexOf(e, this.pos + 1);
    if (e === "'")
      for (; t !== -1 && this.buffer[t + 1] === "'"; )
        t = this.buffer.indexOf("'", t + 2);
    else
      for (; t !== -1; ) {
        let r = 0;
        for (; this.buffer[t - 1 - r] === "\\"; )
          r += 1;
        if (r % 2 === 0)
          break;
        t = this.buffer.indexOf('"', t + 1);
      }
    const n = this.buffer.substring(0, t);
    let i = n.indexOf(`
`, this.pos);
    if (i !== -1) {
      for (; i !== -1; ) {
        const r = this.continueScalar(i + 1);
        if (r === -1)
          break;
        i = n.indexOf(`
`, r);
      }
      i !== -1 && (t = i - (n[i - 1] === "\r" ? 2 : 1));
    }
    if (t === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      t = this.buffer.length;
    }
    return yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1, this.blockScalarKeep = !1;
    let e = this.pos;
    for (; ; ) {
      const t = this.buffer[++e];
      if (t === "+")
        this.blockScalarKeep = !0;
      else if (t > "0" && t <= "9")
        this.blockScalarIndent = Number(t) - 1;
      else if (t !== "-")
        break;
    }
    return yield* this.pushUntil((t) => D(t) || t === "#");
  }
  *parseBlockScalar() {
    let e = this.pos - 1, t = 0, n;
    e:
      for (let i = this.pos; n = this.buffer[i]; ++i)
        switch (n) {
          case " ":
            t += 1;
            break;
          case `
`:
            e = i, t = 0;
            break;
          case "\r": {
            const r = this.buffer[i + 1];
            if (!r && !this.atEnd)
              return this.setNext("block-scalar");
            if (r === `
`)
              break;
          }
          default:
            break e;
        }
    if (!n && !this.atEnd)
      return this.setNext("block-scalar");
    if (t >= this.indentNext) {
      this.blockScalarIndent === -1 ? this.indentNext = t : this.indentNext += this.blockScalarIndent;
      do {
        const i = this.continueScalar(e + 1);
        if (i === -1)
          break;
        e = this.buffer.indexOf(`
`, i);
      } while (e !== -1);
      if (e === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        e = this.buffer.length;
      }
    }
    if (!this.blockScalarKeep)
      do {
        let i = e - 1, r = this.buffer[i];
        r === "\r" && (r = this.buffer[--i]);
        const o = i;
        for (; r === " " || r === "	"; )
          r = this.buffer[--i];
        if (r === `
` && i >= this.pos && i + 1 + t > o)
          e = i;
        else
          break;
      } while (!0);
    return yield xe, yield* this.pushToIndex(e + 1, !0), yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const e = this.flowLevel > 0;
    let t = this.pos - 1, n = this.pos - 1, i;
    for (; i = this.buffer[++n]; )
      if (i === ":") {
        const r = this.buffer[n + 1];
        if (D(r) || e && r === ",")
          break;
        t = n;
      } else if (D(i)) {
        let r = this.buffer[n + 1];
        if (i === "\r" && (r === `
` ? (n += 1, i = `
`, r = this.buffer[n + 1]) : t = n), r === "#" || e && Ge.includes(r))
          break;
        if (i === `
`) {
          const o = this.continueScalar(n + 1);
          if (o === -1)
            break;
          n = Math.max(n, o - 2);
        }
      } else {
        if (e && Ge.includes(i))
          break;
        t = n;
      }
    return !i && !this.atEnd ? this.setNext("plain-scalar") : (yield xe, yield* this.pushToIndex(t + 1, !0), e ? "flow" : "doc");
  }
  *pushCount(e) {
    return e > 0 ? (yield this.buffer.substr(this.pos, e), this.pos += e, e) : 0;
  }
  *pushToIndex(e, t) {
    const n = this.buffer.slice(this.pos, e);
    return n ? (yield n, this.pos += n.length, n.length) : (t && (yield ""), 0);
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(We)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "-":
      case "?":
      case ":": {
        const e = this.flowLevel > 0, t = this.charAt(1);
        if (D(t) || e && Ge.includes(t))
          return e ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let e = this.pos + 2, t = this.buffer[e];
      for (; !D(t) && t !== ">"; )
        t = this.buffer[++e];
      return yield* this.pushToIndex(t === ">" ? e + 1 : e, !1);
    } else {
      let e = this.pos + 1, t = this.buffer[e];
      for (; t; )
        if (dn.includes(t))
          t = this.buffer[++e];
        else if (t === "%" && It.includes(this.buffer[e + 1]) && It.includes(this.buffer[e + 2]))
          t = this.buffer[e += 3];
        else
          break;
      return yield* this.pushToIndex(e, !1);
    }
  }
  *pushNewline() {
    const e = this.buffer[this.pos];
    return e === `
` ? yield* this.pushCount(1) : e === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
  }
  *pushSpaces(e) {
    let t = this.pos - 1, n;
    do
      n = this.buffer[++t];
    while (n === " " || e && n === "	");
    const i = t - this.pos;
    return i > 0 && (yield this.buffer.substr(this.pos, i), this.pos = t), i;
  }
  *pushUntil(e) {
    let t = this.pos, n = this.buffer[t];
    for (; !e(n); )
      n = this.buffer[++t];
    return yield* this.pushToIndex(t, !1);
  }
}
class gn {
  constructor() {
    this.lineStarts = [], this.addNewLine = (e) => this.lineStarts.push(e), this.linePos = (e) => {
      let t = 0, n = this.lineStarts.length;
      for (; t < n; ) {
        const r = t + n >> 1;
        this.lineStarts[r] < e ? t = r + 1 : n = r;
      }
      if (this.lineStarts[t] === e)
        return { line: t + 1, col: 1 };
      if (t === 0)
        return { line: 0, col: e };
      const i = this.lineStarts[t - 1];
      return { line: t, col: e - i + 1 };
    };
  }
}
function K(s, e) {
  for (let t = 0; t < s.length; ++t)
    if (s[t].type === e)
      return !0;
  return !1;
}
function Tt(s) {
  for (let e = 0; e < s.length; ++e)
    switch (s[e].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return e;
    }
  return -1;
}
function as(s) {
  switch (s == null ? void 0 : s.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return !0;
    default:
      return !1;
  }
}
function Ie(s) {
  switch (s.type) {
    case "document":
      return s.start;
    case "block-map": {
      const e = s.items[s.items.length - 1];
      return e.sep ?? e.start;
    }
    case "block-seq":
      return s.items[s.items.length - 1].start;
    default:
      return [];
  }
}
function x(s) {
  var t;
  if (s.length === 0)
    return [];
  let e = s.length;
  e:
    for (; --e >= 0; )
      switch (s[e].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break e;
      }
  for (; ((t = s[++e]) == null ? void 0 : t.type) === "space"; )
    ;
  return s.splice(e, s.length);
}
function Et(s) {
  if (s.start.type === "flow-seq-start")
    for (const e of s.items)
      e.sep && !e.value && !K(e.start, "explicit-key-ind") && !K(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, as(e.value) ? e.value.end ? Array.prototype.push.apply(e.value.end, e.sep) : e.value.end = e.sep : Array.prototype.push.apply(e.start, e.sep), delete e.sep);
}
class yn {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(e) {
    this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new mn(), this.onNewLine = e;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(e, t = !1) {
    this.onNewLine && this.offset === 0 && this.onNewLine(0);
    for (const n of this.lexer.lex(e, t))
      yield* this.next(n);
    t || (yield* this.end());
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(e) {
    if (this.source = e, this.atScalar) {
      this.atScalar = !1, yield* this.step(), this.offset += e.length;
      return;
    }
    const t = hn(e);
    if (t)
      if (t === "scalar")
        this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
      else {
        switch (this.type = t, yield* this.step(), t) {
          case "newline":
            this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + e.length);
            break;
          case "space":
            this.atNewLine && e[0] === " " && (this.indent += e.length);
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            this.atNewLine && (this.indent += e.length);
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = !1;
        }
        this.offset += e.length;
      }
    else {
      const n = `Not a YAML token: ${e}`;
      yield* this.pop({ type: "error", offset: this.offset, message: n, source: e }), this.offset += e.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    for (; this.stack.length > 0; )
      yield* this.pop();
  }
  get sourceToken() {
    return {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  *step() {
    const e = this.peek(1);
    if (this.type === "doc-end" && (!e || e.type !== "doc-end")) {
      for (; this.stack.length > 0; )
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!e)
      return yield* this.stream();
    switch (e.type) {
      case "document":
        return yield* this.document(e);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(e);
      case "block-scalar":
        return yield* this.blockScalar(e);
      case "block-map":
        return yield* this.blockMap(e);
      case "block-seq":
        return yield* this.blockSequence(e);
      case "flow-collection":
        return yield* this.flowCollection(e);
      case "doc-end":
        return yield* this.documentEnd(e);
    }
    yield* this.pop();
  }
  peek(e) {
    return this.stack[this.stack.length - e];
  }
  *pop(e) {
    const t = e ?? this.stack.pop();
    if (!t)
      yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
    else if (this.stack.length === 0)
      yield t;
    else {
      const n = this.peek(1);
      switch (t.type === "block-scalar" ? t.indent = "indent" in n ? n.indent : 0 : t.type === "flow-collection" && n.type === "document" && (t.indent = 0), t.type === "flow-collection" && Et(t), n.type) {
        case "document":
          n.value = t;
          break;
        case "block-scalar":
          n.props.push(t);
          break;
        case "block-map": {
          const i = n.items[n.items.length - 1];
          if (i.value) {
            n.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
            return;
          } else if (i.sep)
            i.value = t;
          else {
            Object.assign(i, { key: t, sep: [] }), this.onKeyLine = !K(i.start, "explicit-key-ind");
            return;
          }
          break;
        }
        case "block-seq": {
          const i = n.items[n.items.length - 1];
          i.value ? n.items.push({ start: [], value: t }) : i.value = t;
          break;
        }
        case "flow-collection": {
          const i = n.items[n.items.length - 1];
          !i || i.value ? n.items.push({ start: [], key: t, sep: [] }) : i.sep ? i.value = t : Object.assign(i, { key: t, sep: [] });
          return;
        }
        default:
          yield* this.pop(), yield* this.pop(t);
      }
      if ((n.type === "document" || n.type === "block-map" || n.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
        const i = t.items[t.items.length - 1];
        i && !i.sep && !i.value && i.start.length > 0 && Tt(i.start) === -1 && (t.indent === 0 || i.start.every((r) => r.type !== "comment" || r.indent < t.indent)) && (n.type === "document" ? n.end = i.start : n.items.push({ start: i.start }), t.items.splice(-1, 1));
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const e = {
          type: "document",
          offset: this.offset,
          start: []
        };
        this.type === "doc-start" && e.start.push(this.sourceToken), this.stack.push(e);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(e) {
    if (e.value)
      return yield* this.lineEnd(e);
    switch (this.type) {
      case "doc-start": {
        Tt(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        e.start.push(this.sourceToken);
        return;
    }
    const t = this.startBlockValue(e);
    t ? this.stack.push(t) : yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML document`,
      source: this.source
    };
  }
  *scalar(e) {
    if (this.type === "map-value-ind") {
      const t = Ie(this.peek(2)), n = x(t);
      let i;
      e.end ? (i = e.end, i.push(this.sourceToken), delete e.end) : i = [this.sourceToken];
      const r = {
        type: "block-map",
        offset: e.offset,
        indent: e.indent,
        items: [{ start: n, key: e, sep: i }]
      };
      this.onKeyLine = !0, this.stack[this.stack.length - 1] = r;
    } else
      yield* this.lineEnd(e);
  }
  *blockScalar(e) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        e.props.push(this.sourceToken);
        return;
      case "scalar":
        if (e.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
          let t = this.source.indexOf(`
`) + 1;
          for (; t !== 0; )
            this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop(), yield* this.step();
    }
  }
  *blockMap(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (this.onKeyLine = !1, t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else if (t.sep)
          t.sep.push(this.sourceToken);
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= e.indent) {
      const i = !this.onKeyLine && this.indent === e.indent && t.sep && this.type !== "seq-item-ind";
      let r = [];
      if (i && t.sep && !t.value) {
        const o = [];
        for (let l = 0; l < t.sep.length; ++l) {
          const a = t.sep[l];
          switch (a.type) {
            case "newline":
              o.push(l);
              break;
            case "space":
              break;
            case "comment":
              a.indent > e.indent && (o.length = 0);
              break;
            default:
              o.length = 0;
          }
        }
        o.length >= 2 && (r = t.sep.splice(o[1]));
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          i || t.value ? (r.push(this.sourceToken), e.items.push({ start: r }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "explicit-key-ind":
          !t.sep && !K(t.start, "explicit-key-ind") ? t.start.push(this.sourceToken) : i || t.value ? (r.push(this.sourceToken), e.items.push({ start: r })) : this.stack.push({
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          }), this.onKeyLine = !0;
          return;
        case "map-value-ind":
          if (K(t.start, "explicit-key-ind"))
            if (t.sep)
              if (t.value)
                e.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (K(t.sep, "map-value-ind"))
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: r, key: null, sep: [this.sourceToken] }]
                });
              else if (as(t.key) && !K(t.sep, "newline")) {
                const o = x(t.start), l = t.key, a = t.sep;
                a.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: o, key: l, sep: a }]
                });
              } else
                r.length > 0 ? t.sep = t.sep.concat(r, this.sourceToken) : t.sep.push(this.sourceToken);
            else if (K(t.start, "newline"))
              Object.assign(t, { key: null, sep: [this.sourceToken] });
            else {
              const o = x(t.start);
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: o, key: null, sep: [this.sourceToken] }]
              });
            }
          else
            t.sep ? t.value || i ? e.items.push({ start: r, key: null, sep: [this.sourceToken] }) : K(t.sep, "map-value-ind") ? this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [], key: null, sep: [this.sourceToken] }]
            }) : t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          this.onKeyLine = !0;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const o = this.flowScalar(this.type);
          i || t.value ? (e.items.push({ start: r, key: o, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(o) : (Object.assign(t, { key: o, sep: [] }), this.onKeyLine = !0);
          return;
        }
        default: {
          const o = this.startBlockValue(e);
          if (o) {
            i && o.type !== "block-seq" && K(t.start, "explicit-key-ind") && e.items.push({ start: r }), this.stack.push(o);
            return;
          }
        }
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *blockSequence(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (t.value || this.indent <= e.indent)
          break;
        t.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== e.indent)
          break;
        t.value || K(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
        return;
    }
    if (this.indent > e.indent) {
      const i = this.startBlockValue(e);
      if (i) {
        this.stack.push(i);
        return;
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *flowCollection(e) {
    const t = e.items[e.items.length - 1];
    if (this.type === "flow-error-end") {
      let n;
      do
        yield* this.pop(), n = this.peek(1);
      while (n && n.type === "flow-collection");
    } else if (e.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          !t || t.sep ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          !t || t.value ? e.items.push({ start: [], key: null, sep: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          !t || t.value ? e.items.push({ start: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const i = this.flowScalar(this.type);
          !t || t.value ? e.items.push({ start: [], key: i, sep: [] }) : t.sep ? this.stack.push(i) : Object.assign(t, { key: i, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          e.end.push(this.sourceToken);
          return;
      }
      const n = this.startBlockValue(e);
      n ? this.stack.push(n) : (yield* this.pop(), yield* this.step());
    } else {
      const n = this.peek(2);
      if (n.type === "block-map" && (this.type === "map-value-ind" && n.indent === e.indent || this.type === "newline" && !n.items[n.items.length - 1].sep))
        yield* this.pop(), yield* this.step();
      else if (this.type === "map-value-ind" && n.type !== "flow-collection") {
        const i = Ie(n), r = x(i);
        Et(e);
        const o = e.end.splice(1, e.end.length);
        o.push(this.sourceToken);
        const l = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: r, key: e, sep: o }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = l;
      } else
        yield* this.lineEnd(e);
    }
  }
  flowScalar(e) {
    if (this.onNewLine) {
      let t = this.source.indexOf(`
`) + 1;
      for (; t !== 0; )
        this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
    }
    return {
      type: e,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(e) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = !0;
        const t = Ie(e), n = x(t);
        return n.push(this.sourceToken), {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = !0;
        const t = Ie(e), n = x(t);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(e, t) {
    return this.type !== "comment" || this.indent <= t ? !1 : e.every((n) => n.type === "newline" || n.type === "space");
  }
  *documentEnd(e) {
    this.type !== "doc-mode" && (e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
  }
  *lineEnd(e) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop(), yield* this.step();
        break;
      case "newline":
        this.onKeyLine = !1;
      case "space":
      case "comment":
      default:
        e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
    }
  }
}
function bn(s) {
  const e = s.prettyErrors !== !1;
  return { lineCounter: s.lineCounter || e && new gn() || null, prettyErrors: e };
}
function wn(s, e = {}) {
  const { lineCounter: t, prettyErrors: n } = bn(e), i = new yn(t == null ? void 0 : t.addNewLine), r = new un(e);
  let o = null;
  for (const l of r.compose(i.parse(s), !0, s.length))
    if (!o)
      o = l;
    else if (o.options.logLevel !== "silent") {
      o.errors.push(new pe(l.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  return n && t && (o.errors.forEach(Nt(s, t)), o.warnings.forEach(Nt(s, t))), o;
}
function kn(s, e, t) {
  let n;
  const i = wn(s, t);
  if (!i)
    return null;
  if (i.warnings.forEach((r) => Pt(i.options.logLevel, r)), i.errors.length > 0) {
    if (i.options.logLevel !== "silent")
      throw i.errors[0];
    i.errors = [];
  }
  return i.toJS(Object.assign({ reviver: n }, t));
}
function Cn(s) {
  let e;
  try {
    e = JSON.parse(s);
  } catch {
  }
  try {
    e = kn(s);
  } catch {
  }
  if (!ue(e) || !Array.isArray(e.resources))
    return;
  const t = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: []
  }, n = e.resources.filter(Tn);
  for (const i of n) {
    const r = e.resources.find(
      (a) => Lt(a) && a.parentId === i._id
    );
    t.workspaces.push({
      id: j(i._id),
      createdAt: new Date(n.created ?? Date.now()).toISOString().replace("Z", ""),
      updatedAt: new Date(n.updated ?? Date.now()).toISOString().replace("Z", ""),
      model: "workspace",
      name: i.name,
      variables: r ? In(r.data) : []
    });
    const o = e.resources.filter(
      (a) => Lt(a) && a.parentId === (r == null ? void 0 : r._id)
    );
    t.environments.push(
      ...o.map((a) => Sn(a, i._id))
    );
    const l = (a) => {
      const c = e.resources.filter((f) => f.parentId === a);
      let d = 0;
      for (const f of c)
        En(f) ? (t.folders.push(Nn(f, i._id)), l(f._id)) : Ln(f) ? t.httpRequests.push(
          An(f, i._id, d++)
        ) : $n(f) && t.grpcRequests.push(
          On(f, i._id, d++)
        );
    };
    l(i._id);
  }
  return t.httpRequests = t.httpRequests.filter(Boolean), t.grpcRequests = t.grpcRequests.filter(Boolean), t.environments = t.environments.filter(Boolean), t.workspaces = t.workspaces.filter(Boolean), { resources: t };
}
function Sn(s, e) {
  return {
    id: j(s._id),
    createdAt: new Date(s.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(s.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: j(e),
    model: "environment",
    name: s.name,
    variables: Object.entries(s.data).map(([t, n]) => ({
      enabled: !0,
      name: t,
      value: `${n}`
    }))
  };
}
function Nn(s, e) {
  return {
    id: j(s._id),
    createdAt: new Date(s.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(s.updated ?? Date.now()).toISOString().replace("Z", ""),
    folderId: s.parentId === e ? null : j(s.parentId),
    workspaceId: j(e),
    model: "folder",
    name: s.name
  };
}
function On(s, e, t = 0) {
  var o;
  const n = s.protoMethodName.split("/").filter((l) => l !== ""), i = n[0] ?? null, r = n[1] ?? null;
  return {
    id: j(s._id),
    createdAt: new Date(s.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(s.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: j(e),
    folderId: s.parentId === e ? null : j(s.parentId),
    model: "grpc_request",
    sortPriority: t,
    name: s.name,
    url: G(s.url),
    service: i,
    method: r,
    message: ((o = s.body) == null ? void 0 : o.text) ?? "",
    metadata: (s.metadata ?? []).map((l) => ({
      enabled: !l.disabled,
      name: l.name ?? "",
      value: l.value ?? ""
    })).filter(({ name: l, value: a }) => l !== "" || a !== "")
  };
}
function An(s, e, t = 0) {
  var l, a, c, d;
  let n = null, i = {};
  s.body.mimeType === "application/octet-stream" ? (n = "binary", i = { filePath: s.body.fileName ?? "" }) : ((l = s.body) == null ? void 0 : l.mimeType) === "application/x-www-form-urlencoded" ? (n = "application/x-www-form-urlencoded", i = {
    form: (s.body.params ?? []).map((f) => ({
      enabled: !f.disabled,
      name: f.name ?? "",
      value: f.value ?? ""
    }))
  }) : ((a = s.body) == null ? void 0 : a.mimeType) === "multipart/form-data" ? (n = "multipart/form-data", i = {
    form: (s.body.params ?? []).map((f) => ({
      enabled: !f.disabled,
      name: f.name ?? "",
      value: f.value ?? "",
      file: f.fileName ?? null
    }))
  }) : ((c = s.body) == null ? void 0 : c.mimeType) === "application/graphql" ? (n = "graphql", i = { text: G(s.body.text ?? "") }) : ((d = s.body) == null ? void 0 : d.mimeType) === "application/json" && (n = "application/json", i = { text: G(s.body.text ?? "") });
  let r = null, o = {};
  return s.authentication.type === "bearer" ? (r = "bearer", o = {
    token: G(s.authentication.token)
  }) : s.authentication.type === "basic" && (r = "basic", o = {
    username: G(s.authentication.username),
    password: G(s.authentication.password)
  }), {
    id: j(s._id),
    createdAt: new Date(s.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(s.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: j(e),
    folderId: s.parentId === e ? null : j(s.parentId),
    model: "http_request",
    sortPriority: t,
    name: s.name,
    url: G(s.url),
    body: i,
    bodyType: n,
    authentication: o,
    authenticationType: r,
    method: s.method,
    headers: (s.headers ?? []).map((f) => ({
      enabled: !f.disabled,
      name: f.name ?? "",
      value: f.value ?? ""
    })).filter(({ name: f, value: u }) => f !== "" || u !== "")
  };
}
function In(s) {
  return Object.entries(s).map(([e, t]) => ({
    enabled: !0,
    name: e,
    value: `${t}`
  }));
}
function G(s) {
  return _n(s) ? s.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : s;
}
function Tn(s) {
  return ue(s) && s._type === "workspace";
}
function En(s) {
  return ue(s) && s._type === "request_group";
}
function Ln(s) {
  return ue(s) && s._type === "request";
}
function $n(s) {
  return ue(s) && s._type === "grpc_request";
}
function Lt(s) {
  return ue(s) && s._type === "environment";
}
function ue(s) {
  return Object.prototype.toString.call(s) === "[object Object]";
}
function _n(s) {
  return Object.prototype.toString.call(s) === "[object String]";
}
function j(s) {
  return s.startsWith("GENERATE_ID::") ? s : `GENERATE_ID::${s}`;
}
export {
  Cn as pluginHookImport
};
