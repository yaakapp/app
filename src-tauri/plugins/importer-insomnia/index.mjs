function w(e, a) {
  return console.log("IMPORTING Environment", e._id, e.name, JSON.stringify(e, null, 2)), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: a,
    model: "environment",
    name: e.name,
    variables: Object.entries(e.data).map(([n, i]) => ({
      enabled: !0,
      name: n,
      value: `${i}`
    }))
  };
}
function S(e) {
  return c(e) && e._type === "workspace";
}
function b(e) {
  return c(e) && e._type === "request_group";
}
function h(e) {
  return c(e) && e._type === "request";
}
function I(e) {
  return c(e) && e._type === "grpc_request";
}
function y(e) {
  return c(e) && e._type === "environment";
}
function c(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function _(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
function O(e) {
  return Object.entries(e).map(([a, n]) => ({
    enabled: !0,
    name: a,
    value: `${n}`
  }));
}
function p(e) {
  return _(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : e;
}
function D(e, a, n = 0) {
  var s, r, u, m;
  let i = null, o = {};
  e.body.mimeType === "application/octet-stream" ? (i = "binary", o = { filePath: e.body.fileName ?? "" }) : ((s = e.body) == null ? void 0 : s.mimeType) === "application/x-www-form-urlencoded" ? (i = "application/x-www-form-urlencoded", o = {
    form: (e.body.params ?? []).map((t) => ({
      enabled: !t.disabled,
      name: t.name ?? "",
      value: t.value ?? ""
    }))
  }) : ((r = e.body) == null ? void 0 : r.mimeType) === "multipart/form-data" ? (i = "multipart/form-data", o = {
    form: (e.body.params ?? []).map((t) => ({
      enabled: !t.disabled,
      name: t.name,
      value: t.value,
      file: t.fileName ?? null
    }))
  }) : ((u = e.body) == null ? void 0 : u.mimeType) === "application/graphql" ? (i = "graphql", o = { text: p(e.body.text ?? "") }) : ((m = e.body) == null ? void 0 : m.mimeType) === "application/json" && (i = "application/json", o = { text: p(e.body.text ?? "") });
  let l = null, d = {};
  return e.authentication.type === "bearer" ? (l = "bearer", d = {
    token: p(e.authentication.token)
  }) : e.authentication.type === "basic" && (l = "basic", d = {
    username: p(e.authentication.username),
    password: p(e.authentication.password)
  }), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: a,
    folderId: e.parentId === a ? null : e.parentId,
    model: "http_request",
    sortPriority: n,
    name: e.name,
    url: p(e.url),
    body: o,
    bodyType: i,
    authentication: d,
    authenticationType: l,
    method: e.method,
    headers: (e.headers ?? []).map(({ name: t, value: f, disabled: g }) => ({
      enabled: !g,
      name: t,
      value: f
    })).filter(({ name: t, value: f }) => t !== "" || f !== "")
  };
}
function q(e, a) {
  return console.log("IMPORTING FOLDER", e._id, e.name, JSON.stringify(e, null, 2)), {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    folderId: e.parentId === a ? null : e.parentId,
    workspaceId: a,
    model: "folder",
    name: e.name
  };
}
function R(e, a, n = 0) {
  var d;
  console.log("IMPORTING GRPC REQUEST", e._id, e.name, JSON.stringify(e, null, 2));
  const i = e.protoMethodName.split("/").filter((s) => s !== ""), o = i[0] ?? null, l = i[1] ?? null;
  return {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: a,
    folderId: e.parentId === a ? null : e.parentId,
    model: "grpc_request",
    sortPriority: n,
    name: e.name,
    url: p(e.url),
    service: o,
    method: l,
    message: ((d = e.body) == null ? void 0 : d.text) ?? "",
    metadata: (e.metadata ?? []).map(({ name: s, value: r, disabled: u }) => ({
      enabled: !u,
      name: s,
      value: r
    })).filter(({ name: s, value: r }) => s !== "" || r !== "")
  };
}
function v(e) {
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
  }, i = a.resources.filter(S);
  for (const o of i) {
    const l = a.resources.find(
      (r) => y(r) && r.parentId === o._id
    );
    n.workspaces.push({
      id: o._id,
      createdAt: new Date(i.created ?? Date.now()).toISOString().replace("Z", ""),
      updatedAt: new Date(i.updated ?? Date.now()).toISOString().replace("Z", ""),
      model: "workspace",
      name: o.name,
      variables: l ? O(l.data) : []
    });
    const d = a.resources.filter(
      (r) => y(r) && r.parentId === (l == null ? void 0 : l._id)
    );
    n.environments.push(
      ...d.map((r) => w(r, o._id))
    );
    const s = (r) => {
      const u = a.resources.filter((t) => t.parentId === r);
      let m = 0;
      for (const t of u)
        b(t) ? (n.folders.push(q(t, o._id)), s(t._id)) : h(t) ? n.httpRequests.push(
          D(t, o._id, m++)
        ) : I(t) && (console.log("GRPC", JSON.stringify(t, null, 1)), n.grpcRequests.push(
          R(t, o._id, m++)
        ));
    };
    s(o._id);
  }
  return n.httpRequests = n.httpRequests.filter(Boolean), n.grpcRequests = n.grpcRequests.filter(Boolean), n.environments = n.environments.filter(Boolean), n.workspaces = n.workspaces.filter(Boolean), { resources: n };
}
export {
  v as pluginHookImport
};
