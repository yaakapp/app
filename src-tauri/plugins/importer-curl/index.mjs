var H = "(?:" + [
  "\\|\\|",
  "\\&\\&",
  ";;",
  "\\|\\&",
  "\\<\\(",
  "\\<\\<\\<",
  ">>",
  ">\\&",
  "<\\&",
  "[&;()|<>]"
].join("|") + ")", _ = new RegExp("^" + H + "$"), q = "|&;()<> \\t", M = '"((\\\\"|[^"])*?)"', Q = "'((\\\\'|[^'])*?)'", V = /^#$/, U = "'", G = '"', k = "$", C = "", z = 4294967296;
for (var W = 0; W < 4; W++)
  C += (z * Math.random()).toString(16);
var J = new RegExp("^" + C);
function X(n, s) {
  for (var t = s.lastIndex, r = [], l; l = s.exec(n); )
    r.push(l), s.lastIndex === l.index && (s.lastIndex += 1);
  return s.lastIndex = t, r;
}
function F(n, s, t) {
  var r = typeof n == "function" ? n(t) : n[t];
  return typeof r > "u" && t != "" ? r = "" : typeof r > "u" && (r = "$"), typeof r == "object" ? s + C + JSON.stringify(r) + C : s + r;
}
function K(n, s, t) {
  t || (t = {});
  var r = t.escape || "\\", l = "(\\" + r + `['"` + q + `]|[^\\s'"` + q + "])+", h = new RegExp([
    "(" + H + ")",
    // control chars
    "(" + l + "|" + M + "|" + Q + ")+"
  ].join("|"), "g"), p = X(n, h);
  if (p.length === 0)
    return [];
  s || (s = {});
  var g = !1;
  return p.map(function(d) {
    var e = d[0];
    if (!e || g)
      return;
    if (_.test(e))
      return { op: e };
    var f = !1, T = !1, m = "", R = !1, a;
    function $() {
      a += 1;
      var x, c, O = e.charAt(a);
      if (O === "{") {
        if (a += 1, e.charAt(a) === "}")
          throw new Error("Bad substitution: " + e.slice(a - 2, a + 1));
        if (x = e.indexOf("}", a), x < 0)
          throw new Error("Bad substitution: " + e.slice(a));
        c = e.slice(a, x), a = x;
      } else if (/[*@#?$!_-]/.test(O))
        c = O, a += 1;
      else {
        var w = e.slice(a);
        x = w.match(/[^\w\d_]/), x ? (c = w.slice(0, x.index), a += x.index - 1) : (c = w, a = e.length);
      }
      return F(s, "", c);
    }
    for (a = 0; a < e.length; a++) {
      var u = e.charAt(a);
      if (R = R || !f && (u === "*" || u === "?"), T)
        m += u, T = !1;
      else if (f)
        u === f ? f = !1 : f == U ? m += u : u === r ? (a += 1, u = e.charAt(a), u === G || u === r || u === k ? m += u : m += r + u) : u === k ? m += $() : m += u;
      else if (u === G || u === U)
        f = u;
      else {
        if (_.test(u))
          return { op: e };
        if (V.test(u)) {
          g = !0;
          var b = { comment: n.slice(d.index + a + 1) };
          return m.length ? [m, b] : [b];
        } else
          u === r ? T = !0 : u === k ? m += $() : m += u;
      }
    }
    return R ? { op: "glob", pattern: m } : m;
  }).reduce(function(d, e) {
    return typeof e > "u" ? d : d.concat(e);
  }, []);
}
var Y = function(s, t, r) {
  var l = K(s, t, r);
  return typeof t != "function" ? l : l.reduce(function(h, p) {
    if (typeof p == "object")
      return h.concat(p);
    var g = p.split(RegExp("(" + C + ".*?" + C + ")", "g"));
    return g.length === 1 ? h.concat(g[0]) : h.concat(g.filter(Boolean).map(function(d) {
      return J.test(d) ? JSON.parse(d.split(C)[1]) : d;
    }));
  }, []);
}, Z = Y;
const L = ["d", "data", "data-raw", "data-urlencode", "data-binary", "data-ascii"], ee = [
  ["url"],
  // Specify the URL explicitly
  ["user", "u"],
  // Authentication
  ["digest"],
  // Apply auth as digest
  ["header", "H"],
  ["cookie", "b"],
  ["get", "G"],
  // Put the post data in the URL
  ["d", "data"],
  // Add url encoded data
  ["data-raw"],
  ["data-urlencode"],
  ["data-binary"],
  ["data-ascii"],
  ["form", "F"],
  // Add multipart data
  ["request", "X"],
  // Request method
  L
].flatMap((n) => n);
function ae(n, s) {
  if (!s.match(/^\s*curl /))
    return null;
  const t = [], r = s.replace(/\ncurl/g, "; curl");
  let l = [];
  const p = Z(r).flatMap((e) => typeof e == "string" && e.startsWith("-") && !e.startsWith("--") && e.length > 2 ? [e.slice(0, 2), e.slice(2)] : e);
  for (const e of p) {
    if (typeof e == "string") {
      e.startsWith("$") ? l.push(e.slice(1)) : l.push(e);
      continue;
    }
    if ("comment" in e)
      continue;
    const { op: f } = e;
    if (f === ";") {
      t.push(l), l = [];
      continue;
    }
    if (f != null && f.startsWith("$")) {
      const T = f.slice(2, f.length - 1).replace(/\\'/g, "'");
      l.push(T);
      continue;
    }
    f === "glob" && l.push(e.pattern);
  }
  t.push(l);
  const g = {
    model: "workspace",
    id: N("workspace"),
    name: "Curl Import"
  };
  return {
    resources: {
      httpRequests: t.filter((e) => e[0] === "curl").map((e) => te(e, g.id)),
      workspaces: [g]
    }
  };
}
function te(n, s) {
  const t = {}, r = [];
  for (let i = 1; i < n.length; i++) {
    let o = n[i];
    if (typeof o == "string" && (o = o.trim()), typeof o == "string" && o.match(/^-{1,2}[\w-]+/)) {
      const E = o[0] === "-" && o[1] !== "-";
      let v = o.replace(/^-{1,2}/, "");
      if (!ee.includes(v))
        continue;
      let y;
      const S = n[i + 1];
      E && v.length > 1 ? (y = v.slice(1), v = v.slice(0, 1)) : typeof S == "string" && !S.startsWith("-") ? (y = S, i++) : y = !0, t[v] = t[v] || [], t[v].push(y);
    } else
      o && r.push(o);
  }
  let l, h;
  const p = A(t, r[0] || "", ["url"]), [g, d] = j(p, "?");
  l = (d == null ? void 0 : d.split("&").map((i) => {
    const o = j(i, "=");
    return { name: o[0] ?? "", value: o[1] ?? "", enabled: !0 };
  })) ?? [], h = g ?? p;
  const [e, f] = A(t, "", ["u", "user"]).split(/:(.*)$/), T = A(t, !1, ["digest"]), m = e ? T ? "digest" : "basic" : null, R = e ? {
    username: e.trim(),
    password: (f ?? "").trim()
  } : {}, a = [
    ...t.header || [],
    ...t.H || []
  ].map((i) => {
    const [o, E] = i.split(/:(.*)$/);
    return E ? {
      name: (o ?? "").trim(),
      value: E.trim(),
      enabled: !0
    } : {
      name: (o ?? "").trim().replace(/;$/, ""),
      value: "",
      enabled: !0
    };
  }), $ = [
    ...t.cookie || [],
    ...t.b || []
  ].map((i) => {
    const o = i.split("=", 1)[0], E = i.replace(`${o}=`, "");
    return `${o}=${E}`;
  }).join("; "), u = a.find((i) => i.name.toLowerCase() === "cookie");
  $ && u ? u.value += `; ${$}` : $ && a.push({
    name: "Cookie",
    value: $,
    enabled: !0
  });
  const b = ne(t), x = a.find((i) => i.name.toLowerCase() === "content-type"), c = x ? x.value.split(";")[0] : null, O = [
    ...t.form || [],
    ...t.F || []
  ].map((i) => {
    const o = i.split("="), E = o[0] ?? "", v = o[1] ?? "", y = {
      name: E,
      enabled: !0
    };
    return v.indexOf("@") === 0 ? y.file = v.slice(1) : y.value = v, y;
  });
  let w = {}, I = null;
  const B = A(t, !1, ["G", "get"]);
  b.length > 0 && B ? l.push(...b) : b.length > 0 && (c == null || c === "application/x-www-form-urlencoded") ? (I = c ?? "application/x-www-form-urlencoded", w = {
    form: b.map((i) => ({
      ...i,
      name: decodeURIComponent(i.name || ""),
      value: decodeURIComponent(i.value || "")
    }))
  }, a.push({
    name: "Content-Type",
    value: "application/x-www-form-urlencoded",
    enabled: !0
  })) : b.length > 0 ? (I = c === "application/json" || c === "text/xml" || c === "text/plain" ? c : "other", w = {
    text: b.map(({ name: i, value: o }) => i && o ? `${i}=${o}` : i || o).join("&")
  }) : O.length && (I = c ?? "multipart/form-data", w = {
    form: O
  }, c == null && a.push({
    name: "Content-Type",
    value: "multipart/form-data",
    enabled: !0
  }));
  let P = A(t, "", ["X", "request"]).toUpperCase();
  return P === "" && w && (P = "text" in w || "form" in w ? "POST" : "GET"), {
    id: N("http_request"),
    model: "http_request",
    workspaceId: s,
    name: "",
    urlParameters: l,
    url: h,
    method: P,
    headers: a,
    authentication: R,
    authenticationType: m,
    body: w,
    bodyType: I,
    folderId: null,
    sortPriority: 0
  };
}
function ne(n) {
  let s = [];
  for (const t of L) {
    const r = n[t];
    if (!(!r || r.length === 0))
      for (const l of r) {
        if (typeof l != "string")
          continue;
        const [h, p] = l.split("=");
        l.startsWith("@") ? s.push({
          name: h ?? "",
          value: "",
          filePath: l.slice(1),
          enabled: !0
        }) : s.push({
          name: h ?? "",
          value: t === "data-urlencode" ? encodeURIComponent(p ?? "") : p ?? "",
          enabled: !0
        });
      }
  }
  return s;
}
const A = (n, s, t) => {
  for (const r of t)
    if (n[r] && n[r].length)
      return n[r][0];
  return s;
};
function j(n, s) {
  const t = n.indexOf(s);
  return t > -1 ? [n.slice(0, t), n.slice(t + 1)] : [n];
}
const D = {};
function N(n) {
  return D[n] = (D[n] ?? -1) + 1, `GENERATE_ID::${n.toUpperCase()}_${D[n]}`;
}
export {
  ae as pluginHookImport
};
//# sourceMappingURL=index.mjs.map
