const f = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json", b = "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", w = [b, f];
function A(t) {
  const e = m(t);
  if (e == null)
    return;
  const r = s(e.info);
  if (!w.includes(r.schema) || !Array.isArray(e.item))
    return;
  const a = {
    workspaces: [],
    environments: [],
    requests: [],
    folders: []
  }, c = {
    model: "workspace",
    id: "wrk_0",
    name: r.name || "Postman Import",
    description: r.description || ""
  };
  a.workspaces.push(c);
  const p = (o, l = null) => {
    if (typeof o.name == "string" && Array.isArray(o.item)) {
      const n = {
        model: "folder",
        workspaceId: c.id,
        id: `fld_${a.folders.length}`,
        name: o.name,
        folderId: l
      };
      a.folders.push(n);
      for (const i of o.item)
        p(i, n.id);
    } else if (typeof o.name == "string" && "request" in o) {
      const n = s(o.request), i = T(n.body), u = g(n.auth), y = {
        model: "http_request",
        id: `req_${a.requests.length}`,
        workspaceId: c.id,
        folderId: l,
        name: o.name,
        method: n.method || "GET",
        url: typeof n.url == "string" ? n.url : s(n.url).raw,
        body: i.body,
        bodyType: i.bodyType,
        authentication: u.authentication,
        authenticationType: u.authenticationType,
        headers: [
          ...i.headers,
          ...u.headers,
          ...h(n.header).map((d) => ({
            name: d.key,
            value: d.value,
            enabled: !d.disabled
          }))
        ]
      };
      a.requests.push(y);
    } else
      console.log("Unknown item", o, l);
  };
  for (const o of e.item)
    p(o);
  return { resources: a };
}
function g(t) {
  const e = s(t);
  return "basic" in e ? {
    headers: [],
    authenticationType: "basic",
    authentication: {
      username: e.basic.username || "",
      password: e.basic.password || ""
    }
  } : { headers: [], authenticationType: null, authentication: {} };
}
function T(t) {
  const e = s(t);
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
        { query: e.graphql.query, variables: m(e.graphql.variables) },
        null,
        2
      )
    }
  } : "formdata" in e ? {
    headers: [
      {
        name: "Content-Type",
        value: "application/x-www-form-urlencoded",
        enabled: !0
      }
    ],
    bodyType: "application/x-www-form-urlencoded",
    body: {
      form: h(e.formdata).map((r) => ({
        enabled: !r.disabled,
        name: r.key ?? "",
        value: r.value ?? ""
      }))
    }
  } : { headers: [], bodyType: null, body: {} };
}
function m(t) {
  try {
    return s(JSON.parse(t));
  } catch {
  }
  return null;
}
function s(t) {
  return Object.prototype.toString.call(t) === "[object Object]" ? t : {};
}
function h(t) {
  return Object.prototype.toString.call(t) === "[object Array]" ? t : [];
}
export {
  A as pluginHookImport
};
