var j = "(?:" + [
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
].join("|") + ")", D = new RegExp("^" + j + "$"), q = "|&;()<> \\t", M = '"((\\\\"|[^"])*?)"', Q = "'((\\\\'|[^'])*?)'", V = /^#$/, _ = "'", G = '"', U = "$", $ = "", z = 4294967296;
for (var L = 0; L < 4; L++)
  $ += (z * Math.random()).toString(16);
var J = new RegExp("^" + $);
function X(n, s) {
  for (var e = s.lastIndex, t = [], c; c = s.exec(n); )
    t.push(c), s.lastIndex === c.index && (s.lastIndex += 1);
  return s.lastIndex = e, t;
}
function F(n, s, e) {
  var t = typeof n == "function" ? n(e) : n[e];
  return typeof t > "u" && e != "" ? t = "" : typeof t > "u" && (t = "$"), typeof t == "object" ? s + $ + JSON.stringify(t) + $ : s + t;
}
function K(n, s, e) {
  e || (e = {});
  var t = e.escape || "\\", c = "(\\" + t + `['"` + q + `]|[^\\s'"` + q + "])+", m = new RegExp([
    "(" + j + ")",
    // control chars
    "(" + c + "|" + M + "|" + Q + ")+"
  ].join("|"), "g"), f = X(n, m);
  if (f.length === 0)
    return [];
  s || (s = {});
  var w = !1;
  return f.map(function(r) {
    var a = r[0];
    if (!a || w)
      return;
    if (D.test(a))
      return { op: a };
    var x = !1, C = !1, d = "", O = !1, i;
    function T() {
      i += 1;
      var v, p, R = a.charAt(i);
      if (R === "{") {
        if (i += 1, a.charAt(i) === "}")
          throw new Error("Bad substitution: " + a.slice(i - 2, i + 1));
        if (v = a.indexOf("}", i), v < 0)
          throw new Error("Bad substitution: " + a.slice(i));
        p = a.slice(i, v), i = v;
      } else if (/[*@#?$!_-]/.test(R))
        p = R, i += 1;
      else {
        var g = a.slice(i);
        v = g.match(/[^\w\d_]/), v ? (p = g.slice(0, v.index), i += v.index - 1) : (p = g, i = a.length);
      }
      return F(s, "", p);
    }
    for (i = 0; i < a.length; i++) {
      var u = a.charAt(i);
      if (O = O || !x && (u === "*" || u === "?"), C)
        d += u, C = !1;
      else if (x)
        u === x ? x = !1 : x == _ ? d += u : u === t ? (i += 1, u = a.charAt(i), u === G || u === t || u === U ? d += u : d += t + u) : u === U ? d += T() : d += u;
      else if (u === G || u === _)
        x = u;
      else {
        if (D.test(u))
          return { op: a };
        if (V.test(u)) {
          w = !0;
          var b = { comment: n.slice(r.index + i + 1) };
          return d.length ? [d, b] : [b];
        } else
          u === t ? C = !0 : u === U ? d += T() : d += u;
      }
    }
    return O ? { op: "glob", pattern: d } : d;
  }).reduce(function(r, a) {
    return typeof a > "u" ? r : r.concat(a);
  }, []);
}
var Y = function(s, e, t) {
  var c = K(s, e, t);
  return typeof e != "function" ? c : c.reduce(function(m, f) {
    if (typeof f == "object")
      return m.concat(f);
    var w = f.split(RegExp("(" + $ + ".*?" + $ + ")", "g"));
    return w.length === 1 ? m.concat(w[0]) : m.concat(w.filter(Boolean).map(function(r) {
      return J.test(r) ? JSON.parse(r.split($)[1]) : r;
    }));
  }, []);
}, Z = Y;
const ae = "curl", se = "cURL", ie = "cURL command line tool", H = ["d", "data", "data-raw", "data-urlencode", "data-binary", "data-ascii"], ee = [
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
  H
].flatMap((n) => n);
function oe(n) {
  if (!n.match(/^\s*curl /))
    return null;
  const s = [], e = n.replace(/\ncurl/g, "; curl");
  let t = [];
  const m = Z(e).flatMap((r) => typeof r == "string" && r.startsWith("-") && !r.startsWith("--") && r.length > 2 ? [r.slice(0, 2), r.slice(2)] : r);
  for (const r of m) {
    if (typeof r == "string") {
      r.startsWith("$") ? t.push(r.slice(1)) : t.push(r);
      continue;
    }
    if ("comment" in r)
      continue;
    const { op: a } = r;
    if (a === ";") {
      s.push(t), t = [];
      continue;
    }
    if (a != null && a.startsWith("$")) {
      const x = a.slice(2, a.length - 1).replace(/\\'/g, "'");
      t.push(x);
      continue;
    }
    a === "glob" && t.push(r.pattern);
  }
  s.push(t);
  const f = {
    model: "workspace",
    id: N("workspace"),
    name: "Curl Import"
  };
  return {
    resources: {
      httpRequests: s.filter((r) => r[0] === "curl").map((r) => te(r, f.id)),
      workspaces: [f]
    }
  };
}
function te(n, s) {
  const e = {}, t = [];
  for (let o = 1; o < n.length; o++) {
    let l = n[o];
    if (typeof l == "string" && (l = l.trim()), typeof l == "string" && l.match(/^-{1,2}[\w-]+/)) {
      const E = l[0] === "-" && l[1] !== "-";
      let h = l.replace(/^-{1,2}/, "");
      if (!ee.includes(h))
        continue;
      let y;
      const S = n[o + 1];
      E && h.length > 1 ? (y = h.slice(1), h = h.slice(0, 1)) : typeof S == "string" && !S.startsWith("-") ? (y = S, o++) : y = !0, e[h] = e[h] || [], e[h].push(y);
    } else
      l && t.push(l);
  }
  let c, m;
  const f = A(e, t[0] || "", ["url"]), [w, r] = W(f, "?");
  c = (r == null ? void 0 : r.split("&").map((o) => {
    const l = W(o, "=");
    return { name: l[0] ?? "", value: l[1] ?? "", enabled: !0 };
  })) ?? [], m = w ?? f;
  const [a, x] = A(e, "", ["u", "user"]).split(/:(.*)$/), C = A(e, !1, ["digest"]), d = a ? C ? "digest" : "basic" : null, O = a ? {
    username: a.trim(),
    password: (x ?? "").trim()
  } : {}, i = [
    ...e.header || [],
    ...e.H || []
  ].map((o) => {
    const [l, E] = o.split(/:(.*)$/);
    return E ? {
      name: (l ?? "").trim(),
      value: E.trim(),
      enabled: !0
    } : {
      name: (l ?? "").trim().replace(/;$/, ""),
      value: "",
      enabled: !0
    };
  }), T = [
    ...e.cookie || [],
    ...e.b || []
  ].map((o) => {
    const l = o.split("=", 1)[0], E = o.replace(`${l}=`, "");
    return `${l}=${E}`;
  }).join("; "), u = i.find((o) => o.name.toLowerCase() === "cookie");
  T && u ? u.value += `; ${T}` : T && i.push({
    name: "Cookie",
    value: T,
    enabled: !0
  });
  const b = ne(e), v = i.find((o) => o.name.toLowerCase() === "content-type"), p = v ? v.value.split(";")[0] : null, R = [
    ...e.form || [],
    ...e.F || []
  ].map((o) => {
    const l = o.split("="), E = l[0] ?? "", h = l[1] ?? "", y = {
      name: E,
      enabled: !0
    };
    return h.indexOf("@") === 0 ? y.file = h.slice(1) : y.value = h, y;
  });
  let g = {}, I = null;
  const B = A(e, !1, ["G", "get"]);
  b.length > 0 && B ? c.push(...b) : b.length > 0 && (p == null || p === "application/x-www-form-urlencoded") ? (I = p ?? "application/x-www-form-urlencoded", g = {
    form: b.map((o) => ({
      ...o,
      name: decodeURIComponent(o.name || ""),
      value: decodeURIComponent(o.value || "")
    }))
  }, i.push({
    name: "Content-Type",
    value: "application/x-www-form-urlencoded",
    enabled: !0
  })) : b.length > 0 ? (I = p === "application/json" || p === "text/xml" || p === "text/plain" ? p : "other", g = {
    text: b.map(({ name: o, value: l }) => o && l ? `${o}=${l}` : o || l).join("&")
  }) : R.length && (I = p ?? "multipart/form-data", g = {
    form: R
  }, p == null && i.push({
    name: "Content-Type",
    value: "multipart/form-data",
    enabled: !0
  }));
  let P = A(e, "", ["X", "request"]).toUpperCase();
  return P === "" && g && (P = "text" in g || "form" in g ? "POST" : "GET"), {
    id: N("http_request"),
    model: "http_request",
    workspaceId: s,
    name: "",
    urlParameters: c,
    url: m,
    method: P,
    headers: i,
    authentication: O,
    authenticationType: d,
    body: g,
    bodyType: I,
    folderId: null,
    sortPriority: 0
  };
}
const ne = (n) => {
  let s = [];
  for (const e of H) {
    const t = n[e];
    if (!(!t || t.length === 0))
      for (const c of t) {
        if (typeof c != "string")
          continue;
        const [m, f] = c.split("=");
        c.startsWith("@") ? s.push({
          name: m ?? "",
          value: "",
          filePath: c.slice(1),
          enabled: !0
        }) : s.push({
          name: m ?? "",
          value: e === "data-urlencode" ? encodeURIComponent(f ?? "") : f ?? "",
          enabled: !0
        });
      }
  }
  return s;
}, A = (n, s, e) => {
  for (const t of e)
    if (n[t] && n[t].length)
      return n[t][0];
  return s;
};
function W(n, s) {
  const e = n.indexOf(s);
  return e > -1 ? [n.slice(0, e), n.slice(e + 1)] : [n];
}
const k = {};
function N(n) {
  return k[n] = (k[n] ?? -1) + 1, `GENERATE_ID::${n.toUpperCase()}_${k[n]}`;
}
export {
  ie as description,
  ae as id,
  te as importCommand,
  se as name,
  oe as pluginHookImport
};
