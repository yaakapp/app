function g(e, n) {
  return console.log("IMPORTING Environment", e._id, e.name, JSON.stringify(e, null, 2)), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: n,
    model: "environment",
    name: e.name,
    variables: Object.entries(e.data).map(([t, a]) => ({
      enabled: !0,
      name: t,
      value: `${a}`
    }))
  };
}
function S(e) {
  return m(e) && e._type === "workspace";
}
function I(e) {
  return m(e) && e._type === "request_group";
}
function y(e) {
  return m(e) && e._type === "request";
}
function h(e) {
  return m(e) && e._type === "grpc_request";
}
function f(e) {
  return m(e) && e._type === "environment";
}
function m(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function w(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
function O(e) {
  return Object.entries(e).map(([n, t]) => ({
    enabled: !0,
    name: n,
    value: `${t}`
  }));
}
function d(e) {
  return w(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : e;
}
function _(e, n, t = 0) {
  var l, r;
  console.log("IMPORTING REQUEST", e._id, e.name, JSON.stringify(e, null, 2));
  let a = null, o = null;
  ((l = e.body) == null ? void 0 : l.mimeType) === "application/graphql" ? (a = "graphql", o = d(e.body.text)) : ((r = e.body) == null ? void 0 : r.mimeType) === "application/json" && (a = "application/json", o = d(e.body.text));
  let s = null, p = {};
  return e.authentication.type === "bearer" ? (s = "bearer", p = {
    token: d(e.authentication.token)
  }) : e.authentication.type === "basic" && (s = "basic", p = {
    username: d(e.authentication.username),
    password: d(e.authentication.password)
  }), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: n,
    folderId: e.parentId === n ? null : e.parentId,
    model: "http_request",
    sortPriority: t,
    name: e.name,
    url: d(e.url),
    body: o,
    bodyType: a,
    authentication: p,
    authenticationType: s,
    method: e.method,
    headers: (e.headers ?? []).map(({ name: u, value: c, disabled: i }) => ({
      enabled: !i,
      name: u,
      value: c
    })).filter(({ name: u, value: c }) => u !== "" || c !== "")
  };
}
function R(e, n) {
  return console.log("IMPORTING FOLDER", e._id, e.name, JSON.stringify(e, null, 2)), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    folderId: e.parentId === n ? null : e.parentId,
    workspaceId: n,
    model: "folder",
    name: e.name
  };
}
function D(e, n, t = 0) {
  var p;
  console.log("IMPORTING GRPC REQUEST", e._id, e.name, JSON.stringify(e, null, 2));
  const a = e.protoMethodName.split("/").filter((l) => l !== ""), o = a[0] ?? null, s = a[1] ?? null;
  return {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: n,
    folderId: e.parentId === n ? null : e.parentId,
    model: "grpc_request",
    sortPriority: t,
    name: e.name,
    url: d(e.url),
    service: o,
    method: s,
    message: ((p = e.body) == null ? void 0 : p.text) ?? "",
    metadata: (e.metadata ?? []).map(({ name: l, value: r, disabled: u }) => ({
      enabled: !u,
      name: l,
      value: r
    })).filter(({ name: l, value: r }) => l !== "" || r !== "")
  };
}
function q(e) {
  let n;
  try {
    n = JSON.parse(e);
  } catch {
    return;
  }
  if (!m(n) || !Array.isArray(n.resources))
    return;
  const t = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: []
  }, a = n.resources.filter(S);
  for (const o of a) {
    const s = n.resources.find(
      (r) => f(r) && r.parentId === o._id
    );
    t.workspaces.push({
      id: o._id,
      createdAt: new Date(a.created ?? Date.now()).toISOString().replace("Z", ""),
      updatedAt: new Date(a.updated ?? Date.now()).toISOString().replace("Z", ""),
      model: "workspace",
      name: o.name,
      variables: s ? O(s.data) : []
    });
    const p = n.resources.filter(
      (r) => f(r) && r.parentId === (s == null ? void 0 : s._id)
    );
    t.environments.push(
      ...p.map((r) => g(r, o._id))
    );
    const l = (r) => {
      const u = n.resources.filter((i) => i.parentId === r);
      let c = 0;
      for (const i of u)
        I(i) ? (t.folders.push(R(i, o._id)), l(i._id)) : y(i) ? t.httpRequests.push(
          _(i, o._id, c++)
        ) : h(i) && (console.log("GRPC", JSON.stringify(i, null, 1)), t.grpcRequests.push(
          D(i, o._id, c++)
        ));
    };
    l(o._id);
  }
  return t.httpRequests = t.httpRequests.filter(Boolean), t.grpcRequests = t.grpcRequests.filter(Boolean), t.environments = t.environments.filter(Boolean), t.workspaces = t.workspaces.filter(Boolean), { resources: t };
}
export {
  q as pluginHookImport
};
