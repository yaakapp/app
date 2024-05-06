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
].join("|") + ")", k = new RegExp("^" + j + "$"), U = "|&;()<> \\t", B = '"((\\\\"|[^"])*?)"', N = "'((\\\\'|[^'])*?)'", Q = /^#$/, q = "'", G = '"', S = "$", R = "", V = 4294967296;
for (var L = 0; L < 4; L++)
  R += (V * Math.random()).toString(16);
var z = new RegExp("^" + R);
function J(r, a) {
  for (var e = a.lastIndex, t = [], c; c = a.exec(r); )
    t.push(c), a.lastIndex === c.index && (a.lastIndex += 1);
  return a.lastIndex = e, t;
}
function X(r, a, e) {
  var t = typeof r == "function" ? r(e) : r[e];
  return typeof t > "u" && e != "" ? t = "" : typeof t > "u" && (t = "$"), typeof t == "object" ? a + R + JSON.stringify(t) + R : a + t;
}
function F(r, a, e) {
  e || (e = {});
  var t = e.escape || "\\", c = "(\\" + t + `['"` + U + `]|[^\\s'"` + U + "])+", m = new RegExp([
    "(" + j + ")",
    // control chars
    "(" + c + "|" + B + "|" + N + ")+"
  ].join("|"), "g"), f = J(r, m);
  if (f.length === 0)
    return [];
  a || (a = {});
  var w = !1;
  return f.map(function(n) {
    var s = n[0];
    if (!s || w)
      return;
    if (k.test(s))
      return { op: s };
    var x = !1, O = !1, p = "", A = !1, o;
    function $() {
      o += 1;
      var v, d, T = s.charAt(o);
      if (T === "{") {
        if (o += 1, s.charAt(o) === "}")
          throw new Error("Bad substitution: " + s.slice(o - 2, o + 1));
        if (v = s.indexOf("}", o), v < 0)
          throw new Error("Bad substitution: " + s.slice(o));
        d = s.slice(o, v), o = v;
      } else if (/[*@#?$!_-]/.test(T))
        d = T, o += 1;
      else {
        var g = s.slice(o);
        v = g.match(/[^\w\d_]/), v ? (d = g.slice(0, v.index), o += v.index - 1) : (d = g, o = s.length);
      }
      return X(a, "", d);
    }
    for (o = 0; o < s.length; o++) {
      var u = s.charAt(o);
      if (A = A || !x && (u === "*" || u === "?"), O)
        p += u, O = !1;
      else if (x)
        u === x ? x = !1 : x == q ? p += u : u === t ? (o += 1, u = s.charAt(o), u === G || u === t || u === S ? p += u : p += t + u) : u === S ? p += $() : p += u;
      else if (u === G || u === q)
        x = u;
      else {
        if (k.test(u))
          return { op: s };
        if (Q.test(u)) {
          w = !0;
          var E = { comment: r.slice(n.index + o + 1) };
          return p.length ? [p, E] : [E];
        } else
          u === t ? O = !0 : u === S ? p += $() : p += u;
      }
    }
    return A ? { op: "glob", pattern: p } : p;
  }).reduce(function(n, s) {
    return typeof s > "u" ? n : n.concat(s);
  }, []);
}
var K = function(a, e, t) {
  var c = F(a, e, t);
  return typeof e != "function" ? c : c.reduce(function(m, f) {
    if (typeof f == "object")
      return m.concat(f);
    var w = f.split(RegExp("(" + R + ".*?" + R + ")", "g"));
    return w.length === 1 ? m.concat(w[0]) : m.concat(w.filter(Boolean).map(function(n) {
      return z.test(n) ? JSON.parse(n.split(R)[1]) : n;
    }));
  }, []);
}, Y = K;
const re = "curl", ae = "cURL", se = "cURL command line tool", _ = ["d", "data", "data-raw", "data-urlencode", "data-binary", "data-ascii"], Z = [
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
  _
].flatMap((r) => r), oe = (r) => {
  if (!r.match(/^\s*curl /))
    return null;
  const a = [];
  console.log(1, Date.now());
  const e = r.replace(/\\\n/g, " ").replace(/\n/, "; ");
  console.log(2, Date.now());
  let t = [];
  const m = Y(e).flatMap((n) => typeof n == "string" && n.startsWith("-") && !n.startsWith("--") && n.length > 2 ? [n.slice(0, 2), n.slice(2)] : n);
  for (const n of m) {
    if (typeof n == "string") {
      n.startsWith("$") ? t.push(n.slice(1)) : t.push(n);
      continue;
    }
    if ("comment" in n)
      continue;
    const { op: s } = n;
    if (s === ";") {
      a.push(t), t = [];
      continue;
    }
    if (s != null && s.startsWith("$")) {
      const x = s.slice(2, s.length - 1).replace(/\\'/g, "'");
      t.push(x);
      continue;
    }
    s === "glob" && t.push(n.pattern);
  }
  a.push(t);
  const f = {
    model: "workspace",
    id: H("wk"),
    name: "Curl Import"
  };
  return {
    resources: {
      httpRequests: a.filter((n) => n[0] === "curl").map((n) => ee(n, f.id)),
      workspaces: [f]
    }
  };
};
function ee(r, a) {
  const e = {}, t = [];
  for (let i = 1; i < r.length; i++) {
    let l = r[i];
    if (typeof l == "string" && (l = l.trim()), typeof l == "string" && l.match(/^-{1,2}[\w-]+/)) {
      const y = l[0] === "-" && l[1] !== "-";
      let h = l.replace(/^-{1,2}/, "");
      if (!Z.includes(h))
        continue;
      let b;
      const P = r[i + 1];
      y && h.length > 1 ? (b = h.slice(1), h = h.slice(0, 1)) : typeof P == "string" && !P.startsWith("-") ? (b = P, i++) : b = !0, e[h] = e[h] || [], e[h].push(b);
    } else
      l && t.push(l);
  }
  let c = [], m;
  const f = C(e, t[0] || "", ["url"]), [w, n] = W(f, "?");
  c = (n == null ? void 0 : n.split("&").map((i) => {
    const l = W(i, "=");
    return { name: l[0] ?? "", value: l[1] ?? "" };
  })) ?? [], m = w ?? f;
  const [s, x] = C(e, "", ["u", "user"]).split(/:(.*)$/), O = C(e, !1, ["digest"]), p = s ? O ? "digest" : "basic" : null, A = s ? {
    username: s.trim(),
    password: (x ?? "").trim()
  } : {}, o = [
    ...e.header || [],
    ...e.H || []
  ].map((i) => {
    const [l, y] = i.split(/:(.*)$/);
    return y ? {
      name: (l ?? "").trim(),
      value: y.trim()
    } : {
      name: (l ?? "").trim().replace(/;$/, ""),
      value: ""
    };
  }), $ = [
    ...e.cookie || [],
    ...e.b || []
  ].map((i) => {
    const l = i.split("=", 1)[0], y = i.replace(`${l}=`, "");
    return `${l}=${y}`;
  }).join("; "), u = o.find((i) => i.name.toLowerCase() === "cookie");
  $ && u ? u.value += `; ${$}` : $ && o.push({
    name: "Cookie",
    value: $
  });
  const E = te(e), v = o.find((i) => i.name.toLowerCase() === "content-type"), d = v ? v.value.split(";")[0] : null, T = [
    ...e.form || [],
    ...e.F || []
  ].map((i) => {
    const l = i.split("="), y = l[0] ?? "", h = l[1] ?? "", b = {
      name: y,
      enabled: !0
    };
    return h.indexOf("@") === 0 ? b.file = h.slice(1) : b.value = h, b;
  });
  let g = {}, D = null;
  const M = C(e, !1, ["G", "get"]);
  E.length > 0 && M ? c.push(...E) : E.length > 0 && (d == null || d === "application/x-www-form-urlencoded") ? (D = d ?? "application/x-www-form-urlencoded", g = {
    params: E.map((i) => ({
      ...i,
      name: decodeURIComponent(i.name || ""),
      value: decodeURIComponent(i.value || "")
    }))
  }) : E.length > 0 ? (D = d === "application/json" || d === "text/xml" || d === "text/plain" ? d : "other", g = {
    text: E.map(({ name: i, value: l }) => i && l ? `${i}=${l}` : i || l).join("&")
  }) : T.length && (D = d ?? "multipart/form-data", g = {
    form: T
  });
  let I = C(e, "", ["X", "request"]).toUpperCase();
  return I === "" && g && (I = "text" in g || "params" in g ? "POST" : "GET"), {
    id: H("rq"),
    model: "http_request",
    workspaceId: a,
    name: "",
    urlParameters: c,
    url: m,
    method: I,
    headers: o,
    authentication: A,
    authenticationType: p,
    body: g,
    bodyType: D,
    folderId: null,
    sortPriority: 0
  };
}
const te = (r) => {
  let a = [];
  for (const e of _) {
    const t = r[e];
    if (!(!t || t.length === 0))
      for (const c of t) {
        if (typeof c != "string")
          continue;
        const [m, f] = c.split("=");
        c.startsWith("@") ? a.push({
          name: m ?? "",
          value: "",
          filePath: c.slice(1)
        }) : a.push({
          name: m ?? "",
          value: e === "data-urlencode" ? encodeURIComponent(f ?? "") : f ?? ""
        });
      }
  }
  return a;
}, C = (r, a, e) => {
  for (const t of e)
    if (r[t] && r[t].length)
      return r[t][0];
  return a;
};
function H(r) {
  const a = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let e = `${r}_`;
  for (let t = 0; t < 10; t++) {
    const c = Math.random();
    e += a[Math.floor(c * a.length)];
  }
  return e;
}
function W(r, a) {
  const e = r.indexOf(a);
  return e > -1 ? [r.slice(0, e), r.slice(e + 1)] : [r];
}
export {
  se as description,
  re as id,
  ee as importCommand,
  ae as name,
  oe as pluginHookImport
};
