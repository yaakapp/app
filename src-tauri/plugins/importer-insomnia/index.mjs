function A(e) {
  let a;
  try {
    a = JSON.parse(e);
  } catch {
    return;
  }
  if (!c(a) || !Array.isArray(a.resources))
    return;
  const n = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: []
  }, o = a.resources.filter(_);
  for (const r of o) {
    const l = a.resources.find(
      (i) => w(i) && i.parentId === r._id
    );
    n.workspaces.push({
      id: d(r._id),
      createdAt: new Date(o.created ?? Date.now()).toISOString().replace("Z", ""),
      updatedAt: new Date(o.updated ?? Date.now()).toISOString().replace("Z", ""),
      model: "workspace",
      name: r.name,
      variables: l ? h(l.data) : []
    });
    const p = a.resources.filter(
      (i) => w(i) && i.parentId === (l == null ? void 0 : l._id)
    );
    n.environments.push(
      ...p.map((i) => b(i, r._id))
    );
    const s = (i) => {
      const f = a.resources.filter((t) => t.parentId === i);
      let m = 0;
      for (const t of f)
        D(t) ? (n.folders.push(I(t, r._id)), s(t._id)) : v(t) ? n.httpRequests.push(
          g(t, r._id, m++)
        ) : q(t) && n.grpcRequests.push(
          S(t, r._id, m++)
        );
    };
    s(r._id);
  }
  return n.httpRequests = n.httpRequests.filter(Boolean), n.grpcRequests = n.grpcRequests.filter(Boolean), n.environments = n.environments.filter(Boolean), n.workspaces = n.workspaces.filter(Boolean), { resources: n };
}
function b(e, a) {
  return {
    id: d(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: d(a),
    model: "environment",
    name: e.name,
    variables: Object.entries(e.data).map(([n, o]) => ({
      enabled: !0,
      name: n,
      value: `${o}`
    }))
  };
}
function I(e, a) {
  return {
    id: d(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    folderId: e.parentId === a ? null : d(e.parentId),
    workspaceId: d(a),
    model: "folder",
    name: e.name
  };
}
function S(e, a, n = 0) {
  var p;
  const o = e.protoMethodName.split("/").filter((s) => s !== ""), r = o[0] ?? null, l = o[1] ?? null;
  return {
    id: d(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: d(a),
    folderId: e.parentId === a ? null : d(e.parentId),
    model: "grpc_request",
    sortPriority: n,
    name: e.name,
    url: u(e.url),
    service: r,
    method: l,
    message: ((p = e.body) == null ? void 0 : p.text) ?? "",
    metadata: (e.metadata ?? []).map((s) => ({
      enabled: !s.disabled,
      name: s.name ?? "",
      value: s.value ?? ""
    })).filter(({ name: s, value: i }) => s !== "" || i !== "")
  };
}
function g(e, a, n = 0) {
  var s, i, f, m;
  let o = null, r = {};
  e.body.mimeType === "application/octet-stream" ? (o = "binary", r = { filePath: e.body.fileName ?? "" }) : ((s = e.body) == null ? void 0 : s.mimeType) === "application/x-www-form-urlencoded" ? (o = "application/x-www-form-urlencoded", r = {
    form: (e.body.params ?? []).map((t) => ({
      enabled: !t.disabled,
      name: t.name ?? "",
      value: t.value ?? ""
    }))
  }) : ((i = e.body) == null ? void 0 : i.mimeType) === "multipart/form-data" ? (o = "multipart/form-data", r = {
    form: (e.body.params ?? []).map((t) => ({
      enabled: !t.disabled,
      name: t.name ?? "",
      value: t.value ?? "",
      file: t.fileName ?? null
    }))
  }) : ((f = e.body) == null ? void 0 : f.mimeType) === "application/graphql" ? (o = "graphql", r = { text: u(e.body.text ?? "") }) : ((m = e.body) == null ? void 0 : m.mimeType) === "application/json" && (o = "application/json", r = { text: u(e.body.text ?? "") });
  let l = null, p = {};
  return e.authentication.type === "bearer" ? (l = "bearer", p = {
    token: u(e.authentication.token)
  }) : e.authentication.type === "basic" && (l = "basic", p = {
    username: u(e.authentication.username),
    password: u(e.authentication.password)
  }), {
    id: d(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: d(a),
    folderId: e.parentId === a ? null : d(e.parentId),
    model: "http_request",
    sortPriority: n,
    name: e.name,
    url: u(e.url),
    body: r,
    bodyType: o,
    authentication: p,
    authenticationType: l,
    method: e.method,
    headers: (e.headers ?? []).map((t) => ({
      enabled: !t.disabled,
      name: t.name ?? "",
      value: t.value ?? ""
    })).filter(({ name: t, value: y }) => t !== "" || y !== "")
  };
}
function h(e) {
  return Object.entries(e).map(([a, n]) => ({
    enabled: !0,
    name: a,
    value: `${n}`
  }));
}
function u(e) {
  return O(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : e;
}
function _(e) {
  return c(e) && e._type === "workspace";
}
function D(e) {
  return c(e) && e._type === "request_group";
}
function v(e) {
  return c(e) && e._type === "request";
}
function q(e) {
  return c(e) && e._type === "grpc_request";
}
function w(e) {
  return c(e) && e._type === "environment";
}
function c(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function O(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
function d(e) {
  return e.startsWith("GENERATE_ID::") ? e : `GENERATE_ID::${e}`;
}
export {
  A as pluginHookImport
};
