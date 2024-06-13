function O(e, o) {
  let n;
  try {
    n = JSON.parse(o);
  } catch {
  }
  try {
    n = n ?? YAML.parse(o);
  } catch (a) {
    console.log("FAILED", a);
  }
  if (!f(n) || !Array.isArray(n.resources))
    return;
  const t = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: []
  }, i = n.resources.filter(_);
  for (const a of i) {
    const s = n.resources.find(
      (l) => y(l) && l.parentId === a._id
    );
    t.workspaces.push({
      id: p(a._id),
      createdAt: new Date(i.created ?? Date.now()).toISOString().replace("Z", ""),
      updatedAt: new Date(i.updated ?? Date.now()).toISOString().replace("Z", ""),
      model: "workspace",
      name: a.name,
      variables: s ? h(s.data) : []
    });
    const d = n.resources.filter(
      (l) => y(l) && l.parentId === (s == null ? void 0 : s._id)
    );
    t.environments.push(
      ...d.map((l) => b(l, a._id))
    );
    const c = (l) => {
      const w = n.resources.filter((u) => u.parentId === l);
      let r = 0;
      for (const u of w)
        D(u) ? (t.folders.push(I(u, a._id)), c(u._id)) : v(u) ? t.httpRequests.push(
          g(u, a._id, r++)
        ) : q(u) && t.grpcRequests.push(
          S(u, a._id, r++)
        );
    };
    c(a._id);
  }
  return t.httpRequests = t.httpRequests.filter(Boolean), t.grpcRequests = t.grpcRequests.filter(Boolean), t.environments = t.environments.filter(Boolean), t.workspaces = t.workspaces.filter(Boolean), { resources: t };
}
function b(e, o) {
  return {
    id: p(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: p(o),
    model: "environment",
    name: e.name,
    variables: Object.entries(e.data).map(([n, t]) => ({
      enabled: !0,
      name: n,
      value: `${t}`
    }))
  };
}
function I(e, o) {
  return {
    id: p(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    folderId: e.parentId === o ? null : p(e.parentId),
    workspaceId: p(o),
    model: "folder",
    name: e.name
  };
}
function S(e, o, n = 0) {
  var s;
  const t = e.protoMethodName.split("/").filter((d) => d !== ""), i = t[0] ?? null, a = t[1] ?? null;
  return {
    id: p(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: p(o),
    folderId: e.parentId === o ? null : p(e.parentId),
    model: "grpc_request",
    sortPriority: n,
    name: e.name,
    url: m(e.url),
    service: i,
    method: a,
    message: ((s = e.body) == null ? void 0 : s.text) ?? "",
    metadata: (e.metadata ?? []).map((d) => ({
      enabled: !d.disabled,
      name: d.name ?? "",
      value: d.value ?? ""
    })).filter(({ name: d, value: c }) => d !== "" || c !== "")
  };
}
function g(e, o, n = 0) {
  var d, c, l, w;
  let t = null, i = {};
  e.body.mimeType === "application/octet-stream" ? (t = "binary", i = { filePath: e.body.fileName ?? "" }) : ((d = e.body) == null ? void 0 : d.mimeType) === "application/x-www-form-urlencoded" ? (t = "application/x-www-form-urlencoded", i = {
    form: (e.body.params ?? []).map((r) => ({
      enabled: !r.disabled,
      name: r.name ?? "",
      value: r.value ?? ""
    }))
  }) : ((c = e.body) == null ? void 0 : c.mimeType) === "multipart/form-data" ? (t = "multipart/form-data", i = {
    form: (e.body.params ?? []).map((r) => ({
      enabled: !r.disabled,
      name: r.name ?? "",
      value: r.value ?? "",
      file: r.fileName ?? null
    }))
  }) : ((l = e.body) == null ? void 0 : l.mimeType) === "application/graphql" ? (t = "graphql", i = { text: m(e.body.text ?? "") }) : ((w = e.body) == null ? void 0 : w.mimeType) === "application/json" && (t = "application/json", i = { text: m(e.body.text ?? "") });
  let a = null, s = {};
  return e.authentication.type === "bearer" ? (a = "bearer", s = {
    token: m(e.authentication.token)
  }) : e.authentication.type === "basic" && (a = "basic", s = {
    username: m(e.authentication.username),
    password: m(e.authentication.password)
  }), {
    id: p(e._id),
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace("Z", ""),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace("Z", ""),
    workspaceId: p(o),
    folderId: e.parentId === o ? null : p(e.parentId),
    model: "http_request",
    sortPriority: n,
    name: e.name,
    url: m(e.url),
    body: i,
    bodyType: t,
    authentication: s,
    authenticationType: a,
    method: e.method,
    headers: (e.headers ?? []).map((r) => ({
      enabled: !r.disabled,
      name: r.name ?? "",
      value: r.value ?? ""
    })).filter(({ name: r, value: u }) => r !== "" || u !== "")
  };
}
function h(e) {
  return Object.entries(e).map(([o, n]) => ({
    enabled: !0,
    name: o,
    value: `${n}`
  }));
}
function m(e) {
  return A(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, "${[$2]}") : e;
}
function _(e) {
  return f(e) && e._type === "workspace";
}
function D(e) {
  return f(e) && e._type === "request_group";
}
function v(e) {
  return f(e) && e._type === "request";
}
function q(e) {
  return f(e) && e._type === "grpc_request";
}
function y(e) {
  return f(e) && e._type === "environment";
}
function f(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function A(e) {
  return Object.prototype.toString.call(e) === "[object String]";
}
function p(e) {
  return e.startsWith("GENERATE_ID::") ? e : `GENERATE_ID::${e}`;
}
export {
  O as pluginHookImport
};
//# sourceMappingURL=index.mjs.map
