const b = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", g = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", T = [g, b];
function S(e) {
  const t = h(e);
  if (t == null)
    return;
  const r = s(t.info);
  if (!T.includes(r.schema) || !Array.isArray(t.item))
    return;
  const a = {
    workspaces: [],
    environments: [],
    requests: [],
    folders: []
  }, l = {
    model: "workspace",
    id: "wrk_0",
    name: r.name || "Postman Import",
    description: r.description || ""
  };
  a.workspaces.push(l);
  const y = (n, c = null) => {
    if (typeof n.name == "string" && Array.isArray(n.item)) {
      const o = {
        model: "folder",
        workspaceId: l.id,
        id: `fld_${a.folders.length}`,
        name: n.name,
        folderId: c
      };
      a.folders.push(o);
      for (const i of n.item)
        y(i, o.id);
    } else if (typeof n.name == "string" && "request" in n) {
      const o = s(n.request), i = A(o.body), u = w(o.auth), f = {
        model: "http_request",
        id: `req_${a.requests.length}`,
        workspaceId: l.id,
        folderId: c,
        name: n.name,
        method: o.method || "GET",
        url: typeof o.url == "string" ? o.url : s(o.url).raw,
        body: i.body,
        bodyType: i.bodyType,
        authentication: u.authentication,
        authenticationType: u.authenticationType,
        headers: [
          ...i.headers,
          ...u.headers,
          ...p(o.header).map((d) => ({
            name: d.key,
            value: d.value,
            enabled: !d.disabled
          }))
        ]
      };
      a.requests.push(f);
    } else
      console.log("Unknown item", n, c);
  };
  for (const n of t.item)
    y(n);
  return { resources: m(a) };
}
function w(e) {
  const t = s(e);
  return "basic" in t ? {
    headers: [],
    authenticationType: "basic",
    authentication: {
      username: t.basic.username || "",
      password: t.basic.password || ""
    }
  } : { headers: [], authenticationType: null, authentication: {} };
}
function A(e) {
  const t = s(e);
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
        { query: t.graphql.query, variables: h(t.graphql.variables) },
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
      form: p(t.urlencoded).map((r) => ({
        enabled: !r.disabled,
        name: r.key ?? "",
        value: r.value ?? ""
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
      form: p(t.formdata).map(
        (r) => r.src != null ? {
          enabled: !r.disabled,
          name: r.key ?? "",
          file: r.src ?? ""
        } : {
          enabled: !r.disabled,
          name: r.key ?? "",
          value: r.value ?? ""
        }
      )
    }
  } : { headers: [], bodyType: null, body: {} };
}
function h(e) {
  try {
    return s(JSON.parse(e));
  } catch {
  }
  return null;
}
function s(e) {
  return Object.prototype.toString.call(e) === "[object Object]" ? e : {};
}
function p(e) {
  return Object.prototype.toString.call(e) === "[object Array]" ? e : [];
}
function m(e) {
  return typeof e == "string" ? e.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(e) && e != null ? e.map(m) : typeof e == "object" && e != null ? Object.fromEntries(
    Object.entries(e).map(([t, r]) => [t, m(r)])
  ) : e;
}
export {
  S as pluginHookImport
};
