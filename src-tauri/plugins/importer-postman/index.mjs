const S = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", _ = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", O = [_, S];
function v(e) {
  var g;
  const t = k(e);
  if (t == null)
    return;
  const o = i(t.info);
  if (!O.includes(o.schema) || !Array.isArray(t.item))
    return;
  const u = A(t.auth), s = {
    workspaces: [],
    environments: [],
    httpRequests: [],
    folders: []
  }, n = {
    model: "workspace",
    id: h("workspace"),
    name: o.name || "Postman Import",
    description: o.description || "",
    variables: ((g = t.variable) == null ? void 0 : g.map((r) => ({
      name: r.key,
      value: r.value
    }))) ?? []
  };
  s.workspaces.push(n);
  const T = (r, p = null) => {
    if (typeof r.name == "string" && Array.isArray(r.item)) {
      const a = {
        model: "folder",
        workspaceId: n.id,
        id: h("folder"),
        name: r.name,
        folderId: p
      };
      s.folders.push(a);
      for (const l of r.item)
        T(l, a.id);
    } else if (typeof r.name == "string" && "request" in r) {
      const a = i(r.request), l = j(a.body), w = A(a.auth), d = w.authenticationType == null ? u : w, q = {
        model: "http_request",
        id: h("http_request"),
        workspaceId: n.id,
        folderId: p,
        name: r.name,
        method: a.method || "GET",
        url: typeof a.url == "string" ? a.url : i(a.url).raw,
        body: l.body,
        bodyType: l.bodyType,
        authentication: d.authentication,
        authenticationType: d.authenticationType,
        headers: [
          ...l.headers,
          ...d.headers,
          ...b(a.header).map((m) => ({
            name: m.key,
            value: m.value,
            enabled: !m.disabled
          }))
        ]
      };
      s.httpRequests.push(q);
    } else
      console.log("Unknown item", r, p);
  };
  for (const r of t.item)
    T(r);
  return { resources: f(s) };
}
function A(e) {
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
function j(e) {
  var o, c, u, s;
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
        { query: t.graphql.query, variables: k(t.graphql.variables) },
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
      form: b(t.urlencoded).map((n) => ({
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
      form: b(t.formdata).map(
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
  } : "raw" in t ? {
    headers: [
      {
        name: "Content-Type",
        value: ((c = (o = t.options) == null ? void 0 : o.raw) == null ? void 0 : c.language) === "json" ? "application/json" : "",
        enabled: !0
      }
    ],
    bodyType: ((s = (u = t.options) == null ? void 0 : u.raw) == null ? void 0 : s.language) === "json" ? "application/json" : "other",
    body: {
      text: t.raw ?? ""
    }
  } : { headers: [], bodyType: null, body: {} };
}
function k(e) {
  try {
    return i(JSON.parse(e));
  } catch {
  }
  return null;
}
function i(e) {
  return Object.prototype.toString.call(e) === "[object Object]" ? e : {};
}
function b(e) {
  return Object.prototype.toString.call(e) === "[object Array]" ? e : [];
}
function f(e) {
  return typeof e == "string" ? e.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(e) && e != null ? e.map(f) : typeof e == "object" && e != null ? Object.fromEntries(
    Object.entries(e).map(([t, o]) => [t, f(o)])
  ) : e;
}
const y = {};
function h(e) {
  return y[e] = (y[e] ?? -1) + 1, `GENERATE_ID::${e.toUpperCase()}_${y[e]}`;
}
export {
  v as pluginHookImport
};
