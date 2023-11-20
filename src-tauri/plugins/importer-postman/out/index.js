const T = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", w = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", A = [w, T];
function q(e) {
  const t = b(e);
  if (t == null)
    return;
  const n = a(t.info);
  if (!A.includes(n.schema) || !Array.isArray(t.item))
    return;
  const i = {
    workspaces: [],
    environments: [],
    requests: [],
    folders: []
  }, c = {
    model: "workspace",
    id: m("wk"),
    name: n.name || "Postman Import",
    description: n.description || ""
  };
  i.workspaces.push(c);
  const f = (r, u = null) => {
    if (typeof r.name == "string" && Array.isArray(r.item)) {
      const o = {
        model: "folder",
        workspaceId: c.id,
        id: m("fl"),
        name: r.name,
        folderId: u
      };
      i.folders.push(o);
      for (const s of r.item)
        f(s, o.id);
    } else if (typeof r.name == "string" && "request" in r) {
      const o = a(r.request), s = k(o.body), d = S(o.auth), g = {
        model: "http_request",
        id: m("rq"),
        workspaceId: c.id,
        folderId: u,
        name: r.name,
        method: o.method || "GET",
        url: typeof o.url == "string" ? o.url : a(o.url).raw,
        body: s.body,
        bodyType: s.bodyType,
        authentication: d.authentication,
        authenticationType: d.authenticationType,
        headers: [
          ...s.headers,
          ...d.headers,
          ...y(o.header).map((p) => ({
            name: p.key,
            value: p.value,
            enabled: !p.disabled
          }))
        ]
      };
      i.requests.push(g);
    } else
      console.log("Unknown item", r, u);
  };
  for (const r of t.item)
    f(r);
  return { resources: h(i) };
}
function S(e) {
  const t = a(e);
  return "basic" in t ? {
    headers: [],
    authenticationType: "basic",
    authentication: {
      username: t.basic.username || "",
      password: t.basic.password || ""
    }
  } : { headers: [], authenticationType: null, authentication: {} };
}
function k(e) {
  const t = a(e);
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
        { query: t.graphql.query, variables: b(t.graphql.variables) },
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
      form: y(t.urlencoded).map((n) => ({
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
      form: y(t.formdata).map(
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
function b(e) {
  try {
    return a(JSON.parse(e));
  } catch {
  }
  return null;
}
function a(e) {
  return Object.prototype.toString.call(e) === "[object Object]" ? e : {};
}
function y(e) {
  return Object.prototype.toString.call(e) === "[object Array]" ? e : [];
}
function h(e) {
  return typeof e == "string" ? e.replace(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : Array.isArray(e) && e != null ? e.map(h) : typeof e == "object" && e != null ? Object.fromEntries(
    Object.entries(e).map(([t, n]) => [t, h(n)])
  ) : e;
}
function m(e) {
  const t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let n = `${e}_`;
  for (let l = 0; l < 10; l++)
    n += t[Math.floor(Math.random() * t.length)];
  return n;
}
export {
  q as pluginHookImport
};
