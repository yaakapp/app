const q = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", S = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", _ = [S, q];
function j(t) {
  var g;
  const e = A(t);
  if (e == null)
    return;
  const a = l(e.info);
  if (!_.includes(a.schema) || !Array.isArray(e.item))
    return;
  const c = w(e.auth), s = {
    workspaces: [],
    environments: [],
    httpRequests: [],
    folders: []
  }, n = {
    model: "workspace",
    id: y("wk"),
    name: a.name || "Postman Import",
    description: a.description || "",
    variables: ((g = e.variable) == null ? void 0 : g.map((r) => ({
      name: r.key,
      value: r.value
    }))) ?? []
  };
  s.workspaces.push(n);
  const f = (r, d = null) => {
    if (typeof r.name == "string" && Array.isArray(r.item)) {
      const o = {
        model: "folder",
        workspaceId: n.id,
        id: y("fl"),
        name: r.name,
        folderId: d
      };
      s.folders.push(o);
      for (const u of r.item)
        f(u, o.id);
    } else if (typeof r.name == "string" && "request" in r) {
      const o = l(r.request), u = O(o.body), T = w(o.auth), p = T.authenticationType == null ? c : T, k = {
        model: "http_request",
        id: y("rq"),
        workspaceId: n.id,
        folderId: d,
        name: r.name,
        method: o.method || "GET",
        url: typeof o.url == "string" ? o.url : l(o.url).raw,
        body: u.body,
        bodyType: u.bodyType,
        authentication: p.authentication,
        authenticationType: p.authenticationType,
        headers: [
          ...u.headers,
          ...p.headers,
          ...h(o.header).map((m) => ({
            name: m.key,
            value: m.value,
            enabled: !m.disabled
          }))
        ]
      };
      s.httpRequests.push(k);
    } else
      console.log("Unknown item", r, d);
  };
  for (const r of e.item)
    f(r);
  return { resources: b(s) };
}
function w(t) {
  const e = l(t);
  return "basic" in e ? {
    headers: [],
    authenticationType: "basic",
    authentication: {
      username: e.basic.username || "",
      password: e.basic.password || ""
    }
  } : "bearer" in e ? {
    headers: [],
    authenticationType: "bearer",
    authentication: {
      token: e.bearer.token || ""
    }
  } : { headers: [], authenticationType: null, authentication: {} };
}
function O(t) {
  var a, i, c, s;
  const e = l(t);
  return "graphql" in e ? {
    headers: [
      {
        name: "Content-Type",
        value: "application/json",
        enabled: !0
      }
    ],
    bodyType: "graphql",
    body: {
      text: JSON.stringify(
        { query: e.graphql.query, variables: A(e.graphql.variables) },
        null,
        2
      )
    }
  } : "urlencoded" in e ? {
    headers: [
      {
        name: "Content-Type",
        value: "application/x-www-form-urlencoded",
        enabled: !0
      }
    ],
    bodyType: "application/x-www-form-urlencoded",
    body: {
      form: h(e.urlencoded).map((n) => ({
        enabled: !n.disabled,
        name: n.key ?? "",
        value: n.value ?? ""
      }))
    }
  } : "formdata" in e ? {
    headers: [
      {
        name: "Content-Type",
        value: "multipart/form-data",
        enabled: !0
      }
    ],
    bodyType: "multipart/form-data",
    body: {
      form: h(e.formdata).map(
        (n) => n.src != null ? {
          enabled: !n.disabled,
          name: n.key ?? "",
          file: n.src ?? ""
        } : {
          enabled: !n.disabled,
          name: n.key ?? "",
          value: n.value ?? ""
        }
      )
    }
  } : "raw" in e ? {
    headers: [
      {
        name: "Content-Type",
        value: ((i = (a = e.options) == null ? void 0 : a.raw) == null ? void 0 : i.language) === "json" ? "application/json" : "",
        enabled: !0
      }
    ],
    bodyType: ((s = (c = e.options) == null ? void 0 : c.raw) == null ? void 0 : s.language) === "json" ? "application/json" : "other",
    body: {
      text: e.raw ?? ""
    }
  } : { headers: [], bodyType: null, body: {} };
}
function A(t) {
  try {
    return l(JSON.parse(t));
  } catch {
  }
  return null;
}
function l(t) {
  return Object.prototype.toString.call(t) === "[object Object]" ? t : {};
}
function h(t) {
  return Object.prototype.toString.call(t) === "[object Array]" ? t : [];
}
function b(t) {
  return typeof t == "string" ? t.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(t) && t != null ? t.map(b) : typeof t == "object" && t != null ? Object.fromEntries(
    Object.entries(t).map(([e, a]) => [e, b(a)])
  ) : t;
}
function y(t) {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let a = `${t}_`;
  for (let i = 0; i < 10; i++)
    a += e[Math.floor(Math.random() * e.length)];
  return a;
}
export {
  y as generateId,
  j as pluginHookImport
};
