const S = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", O = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", j = [O, S];
function C(e, t) {
  var w;
  const a = _(t);
  if (a == null)
    return;
  const s = i(a.info);
  if (!j.includes(s.schema) || !Array.isArray(a.item))
    return;
  const u = k(a.auth), n = {
    workspaces: [],
    environments: [],
    httpRequests: [],
    folders: []
  }, p = {
    model: "workspace",
    id: b("workspace"),
    name: s.name || "Postman Import",
    description: s.description || "",
    variables: ((w = a.variable) == null ? void 0 : w.map((r) => ({
      name: r.key,
      value: r.value
    }))) ?? []
  };
  n.workspaces.push(p);
  const g = (r, d = null) => {
    if (typeof r.name == "string" && Array.isArray(r.item)) {
      const o = {
        model: "folder",
        workspaceId: p.id,
        id: b("folder"),
        name: r.name,
        folderId: d
      };
      n.folders.push(o);
      for (const l of r.item)
        g(l, o.id);
    } else if (typeof r.name == "string" && "request" in r) {
      const o = i(r.request), l = v(o.body), A = k(o.auth), m = A.authenticationType == null ? u : A, q = {
        model: "http_request",
        id: b("http_request"),
        workspaceId: p.id,
        folderId: d,
        name: r.name,
        method: o.method || "GET",
        url: typeof o.url == "string" ? o.url : i(o.url).raw,
        body: l.body,
        bodyType: l.bodyType,
        authentication: m.authentication,
        authenticationType: m.authenticationType,
        headers: [
          ...l.headers,
          ...m.headers,
          ...f(o.header).map((y) => ({
            name: y.key,
            value: y.value,
            enabled: !y.disabled
          }))
        ]
      };
      n.httpRequests.push(q);
    } else
      console.log("Unknown item", r, d);
  };
  for (const r of a.item)
    g(r);
  return { resources: T(n) };
}
function k(e) {
  const t = i(e);
  return "basic" in t ? {
    headers: [],
    authenticationType: "basic",
    authentication: {
      username: t.basic.username || "",
      password: t.basic.password || ""
    }
  } : "bearer" in t ? {
    headers: [],
    authenticationType: "bearer",
    authentication: {
      token: t.bearer.token || ""
    }
  } : { headers: [], authenticationType: null, authentication: {} };
}
function v(e) {
  var a, s, c, u;
  const t = i(e);
  return "graphql" in t ? {
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
        { query: t.graphql.query, variables: _(t.graphql.variables) },
        null,
        2
      )
    }
  } : "urlencoded" in t ? {
    headers: [
      {
        name: "Content-Type",
        value: "application/x-www-form-urlencoded",
        enabled: !0
      }
    ],
    bodyType: "application/x-www-form-urlencoded",
    body: {
      form: f(t.urlencoded).map((n) => ({
        enabled: !n.disabled,
        name: n.key ?? "",
        value: n.value ?? ""
      }))
    }
  } : "formdata" in t ? {
    headers: [
      {
        name: "Content-Type",
        value: "multipart/form-data",
        enabled: !0
      }
    ],
    bodyType: "multipart/form-data",
    body: {
      form: f(t.formdata).map(
        (n) => n.src != null ? {
          enabled: !n.disabled,
          contentType: n.contentType ?? null,
          name: n.key ?? "",
          file: n.src ?? ""
        } : {
          enabled: !n.disabled,
          name: n.key ?? "",
          value: n.value ?? ""
        }
      )
    }
  } : "raw" in t ? {
    headers: [
      {
        name: "Content-Type",
        value: ((s = (a = t.options) == null ? void 0 : a.raw) == null ? void 0 : s.language) === "json" ? "application/json" : "",
        enabled: !0
      }
    ],
    bodyType: ((u = (c = t.options) == null ? void 0 : c.raw) == null ? void 0 : u.language) === "json" ? "application/json" : "other",
    body: {
      text: t.raw ?? ""
    }
  } : { headers: [], bodyType: null, body: {} };
}
function _(e) {
  try {
    return i(JSON.parse(e));
  } catch {
  }
  return null;
}
function i(e) {
  return Object.prototype.toString.call(e) === "[object Object]" ? e : {};
}
function f(e) {
  return Object.prototype.toString.call(e) === "[object Array]" ? e : [];
}
function T(e) {
  return typeof e == "string" ? e.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(e) && e != null ? e.map(T) : typeof e == "object" && e != null ? Object.fromEntries(
    Object.entries(e).map(([t, a]) => [t, T(a)])
  ) : e;
}
const h = {};
function b(e) {
  return h[e] = (h[e] ?? -1) + 1, `GENERATE_ID::${e.toUpperCase()}_${h[e]}`;
}
export {
  C as pluginHookImport
};
//# sourceMappingURL=index.mjs.map
