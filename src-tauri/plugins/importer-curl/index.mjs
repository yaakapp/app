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
].join("|") + ")", D = new RegExp("^" + j + "$"), q = "|&;()<> \\t", M = '"((\\\\"|[^"])*?)"', Q = "'((\\\\'|[^'])*?)'", V = /^#$/, _ = "'", G = '"', U = "$", R = "", z = 4294967296;
for (var L = 0; L < 4; L++)
  R += (z * Math.random()).toString(16);
var J = new RegExp("^" + R);
function X(n, s) {
  for (var e = s.lastIndex, t = [], c; c = s.exec(n); )
    t.push(c), s.lastIndex === c.index && (s.lastIndex += 1);
  return s.lastIndex = e, t;
}
function F(n, s, e) {
  var t = typeof n == "function" ? n(e) : n[e];
  return typeof t > "u" && e != "" ? t = "" : typeof t > "u" && (t = "$"), typeof t == "object" ? s + R + JSON.stringify(t) + R : s + t;
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
    var x = !1, O = !1, p = "", A = !1, i;
    function b() {
      i += 1;
      var v, d, T = a.charAt(i);
      if (T === "{") {
        if (i += 1, a.charAt(i) === "}")
          throw new Error("Bad substitution: " + a.slice(i - 2, i + 1));
        if (v = a.indexOf("}", i), v < 0)
          throw new Error("Bad substitution: " + a.slice(i));
        d = a.slice(i, v), i = v;
      } else if (/[*@#?$!_-]/.test(T))
        d = T, i += 1;
      else {
        var g = a.slice(i);
        v = g.match(/[^\w\d_]/), v ? (d = g.slice(0, v.index), i += v.index - 1) : (d = g, i = a.length);
      }
      return F(s, "", d);
    }
    for (i = 0; i < a.length; i++) {
      var u = a.charAt(i);
      if (A = A || !x && (u === "*" || u === "?"), O)
        p += u, O = !1;
      else if (x)
        u === x ? x = !1 : x == _ ? p += u : u === t ? (i += 1, u = a.charAt(i), u === G || u === t || u === U ? p += u : p += t + u) : u === U ? p += b() : p += u;
      else if (u === G || u === _)
        x = u;
      else {
        if (D.test(u))
          return { op: a };
        if (V.test(u)) {
          w = !0;
          var E = { comment: n.slice(r.index + i + 1) };
          return p.length ? [p, E] : [E];
        } else
          u === t ? O = !0 : u === U ? p += b() : p += u;
      }
    }
    return A ? { op: "glob", pattern: p } : p;
  }).reduce(function(r, a) {
    return typeof a > "u" ? r : r.concat(a);
  }, []);
}
var Y = function(s, e, t) {
  var c = K(s, e, t);
  return typeof e != "function" ? c : c.reduce(function(m, f) {
    if (typeof f == "object")
      return m.concat(f);
    var w = f.split(RegExp("(" + R + ".*?" + R + ")", "g"));
    return w.length === 1 ? m.concat(w[0]) : m.concat(w.filter(Boolean).map(function(r) {
      return J.test(r) ? JSON.parse(r.split(R)[1]) : r;
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
].flatMap((n) => n), oe = (n) => {
  if (!n.match(/^\s*curl /))
    return null;
  const s = [], e = n.replace(/([^\\])\n/g, "$1; ");
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
};
function te(n, s) {
  const e = {}, t = [];
  for (let o = 1; o < n.length; o++) {
    let l = n[o];
    if (typeof l == "string" && (l = l.trim()), typeof l == "string" && l.match(/^-{1,2}[\w-]+/)) {
      const $ = l[0] === "-" && l[1] !== "-";
      let h = l.replace(/^-{1,2}/, "");
      if (!ee.includes(h))
        continue;
      let y;
      const S = n[o + 1];
      $ && h.length > 1 ? (y = h.slice(1), h = h.slice(0, 1)) : typeof S == "string" && !S.startsWith("-") ? (y = S, o++) : y = !0, e[h] = e[h] || [], e[h].push(y);
    } else
      l && t.push(l);
  }
  let c, m;
  const f = C(e, t[0] || "", ["url"]), [w, r] = W(f, "?");
  c = (r == null ? void 0 : r.split("&").map((o) => {
    const l = W(o, "=");
    return { name: l[0] ?? "", value: l[1] ?? "" };
  })) ?? [], m = w ?? f;
  const [a, x] = C(e, "", ["u", "user"]).split(/:(.*)$/), O = C(e, !1, ["digest"]), p = a ? O ? "digest" : "basic" : null, A = a ? {
    username: a.trim(),
    password: (x ?? "").trim()
  } : {}, i = [
    ...e.header || [],
    ...e.H || []
  ].map((o) => {
    const [l, $] = o.split(/:(.*)$/);
    return $ ? {
      name: (l ?? "").trim(),
      value: $.trim()
    } : {
      name: (l ?? "").trim().replace(/;$/, ""),
      value: ""
    };
  }), b = [
    ...e.cookie || [],
    ...e.b || []
  ].map((o) => {
    const l = o.split("=", 1)[0], $ = o.replace(`${l}=`, "");
    return `${l}=${$}`;
  }).join("; "), u = i.find((o) => o.name.toLowerCase() === "cookie");
  b && u ? u.value += `; ${b}` : b && i.push({
    name: "Cookie",
    value: b
  });
  const E = ne(e), v = i.find((o) => o.name.toLowerCase() === "content-type"), d = v ? v.value.split(";")[0] : null, T = [
    ...e.form || [],
    ...e.F || []
  ].map((o) => {
    const l = o.split("="), $ = l[0] ?? "", h = l[1] ?? "", y = {
      name: $,
      enabled: !0
    };
    return h.indexOf("@") === 0 ? y.file = h.slice(1) : y.value = h, y;
  });
  let g = {}, I = null;
  const B = C(e, !1, ["G", "get"]);
  E.length > 0 && B ? c.push(...E) : E.length > 0 && (d == null || d === "application/x-www-form-urlencoded") ? (I = d ?? "application/x-www-form-urlencoded", g = {
    params: E.map((o) => ({
      ...o,
      name: decodeURIComponent(o.name || ""),
      value: decodeURIComponent(o.value || "")
    }))
  }) : E.length > 0 ? (I = d === "application/json" || d === "text/xml" || d === "text/plain" ? d : "other", g = {
    text: E.map(({ name: o, value: l }) => o && l ? `${o}=${l}` : o || l).join("&")
  }) : T.length && (I = d ?? "multipart/form-data", g = {
    form: T
  });
  let P = C(e, "", ["X", "request"]).toUpperCase();
  return P === "" && g && (P = "text" in g || "params" in g ? "POST" : "GET"), {
    id: N("http_request"),
    model: "http_request",
    workspaceId: s,
    name: "",
    urlParameters: c,
    url: m,
    method: P,
    headers: i,
    authentication: A,
    authenticationType: p,
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
          filePath: c.slice(1)
        }) : s.push({
          name: m ?? "",
          value: e === "data-urlencode" ? encodeURIComponent(f ?? "") : f ?? ""
        });
      }
  }
  return s;
}, C = (n, s, e) => {
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
