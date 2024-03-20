const q = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", S = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", _ = [S, q];
function v(t) {
  var b;
  const e = w(t);
  if (e == null)
    return;
  const n = o(e.info);
  if (!_.includes(n.schema) || !Array.isArray(e.item))
    return;
  const A = g(e.auth), i = {
    workspaces: [],
    environments: [],
    httpRequests: [],
    folders: []
  }, c = {
    model: "workspace",
    id: m("wk"),
    name: n.name || "Postman Import",
    description: n.description || "",
    variables: (b = e.variable) == null ? void 0 : b.map((r) => ({
      name: r.key,
      value: r.value
    }))
  };
  i.workspaces.push(c);
  const f = (r, u = null) => {
    if (typeof r.name == "string" && Array.isArray(r.item)) {
      const a = {
        model: "folder",
        workspaceId: c.id,
        id: m("fl"),
        name: r.name,
        folderId: u
      };
      i.folders.push(a);
      for (const s of r.item)
        f(s, a.id);
    } else if (typeof r.name == "string" && "request" in r) {
      const a = o(r.request), s = O(a.body), T = g(a.auth), d = T.authenticationType == null ? A : T, k = {
        model: "http_request",
        id: m("rq"),
        workspaceId: c.id,
        folderId: u,
        name: r.name,
        method: a.method || "GET",
        url: typeof a.url == "string" ? a.url : o(a.url).raw,
        body: s.body,
        bodyType: s.bodyType,
        authentication: d.authentication,
        authenticationType: d.authenticationType,
        headers: [
          ...s.headers,
          ...d.headers,
          ...y(a.header).map((p) => ({
            name: p.key,
            value: p.value,
            enabled: !p.disabled
          }))
        ]
      };
      i.httpRequests.push(k);
    } else
      console.log("Unknown item", r, u);
  };
  for (const r of e.item)
    f(r);
  return { resources: h(i) };
}
function g(t) {
  const e = o(t);
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
  const e = o(t);
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
        { query: e.graphql.query, variables: w(e.graphql.variables) },
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
      form: y(e.urlencoded).map((n) => ({
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
      form: y(e.formdata).map(
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
  } : { headers: [], bodyType: null, body: {} };
}
function w(t) {
  try {
    return o(JSON.parse(t));
  } catch {
  }
  return null;
}
function o(t) {
  return Object.prototype.toString.call(t) === "[object Object]" ? t : {};
}
function y(t) {
  return Object.prototype.toString.call(t) === "[object Array]" ? t : [];
}
function h(t) {
  return typeof t == "string" ? t.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(t) && t != null ? t.map(h) : typeof t == "object" && t != null ? Object.fromEntries(
    Object.entries(t).map(([e, n]) => [e, h(n)])
  ) : t;
}
function m(t) {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let n = `${t}_`;
  for (let l = 0; l < 10; l++)
    n += e[Math.floor(Math.random() * e.length)];
  return n;
}
export {
  m as generateId,
  v as pluginHookImport
};
