function O(e, t) {
  return (
    console.log('IMPORTING Environment', e._id, e.name, JSON.stringify(e, null, 2)),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      workspaceId: t,
      model: 'environment',
      name: e.name,
      variables: Object.entries(e.data).map(([i, s]) => ({
        enabled: !0,
        name: i,
        value: `${s}`,
      })),
    }
  );
}
function g(e) {
  return d(e) && e._type === 'workspace';
}
function y(e) {
  return d(e) && e._type === 'request_group';
}
function _(e) {
  return d(e) && e._type === 'request';
}
function I(e) {
  return d(e) && e._type === 'environment';
}
function d(e) {
  return Object.prototype.toString.call(e) === '[object Object]';
}
function h(e) {
  return Object.prototype.toString.call(e) === '[object String]';
}
function N(e) {
  return Object.entries(e).map(([t, i]) => ({
    enabled: !0,
    name: t,
    value: `${i}`,
  }));
}
function c(e) {
  return h(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}') : e;
}
function D(e, t, i = 0) {
  var a, u;
  console.log('IMPORTING REQUEST', e._id, e.name, JSON.stringify(e, null, 2));
  let s = null,
    n = null;
  ((a = e.body) == null ? void 0 : a.mimeType) === 'application/graphql'
    ? ((s = 'graphql'), (n = c(e.body.text)))
    : ((u = e.body) == null ? void 0 : u.mimeType) === 'application/json' &&
      ((s = 'application/json'), (n = c(e.body.text)));
  let p = null,
    o = {};
  return (
    e.authentication.type === 'bearer'
      ? ((p = 'bearer'),
        (o = {
          token: c(e.authentication.token),
        }))
      : e.authentication.type === 'basic' &&
        ((p = 'basic'),
        (o = {
          username: c(e.authentication.username),
          password: c(e.authentication.password),
        })),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      workspaceId: t,
      folderId: e.parentId === t ? null : e.parentId,
      model: 'http_request',
      sortPriority: i,
      name: e.name,
      url: c(e.url),
      body: n,
      bodyType: s,
      authentication: o,
      authenticationType: p,
      method: e.method,
      headers: (e.headers ?? []).map(({ name: m, value: r, disabled: f }) => ({
        enabled: !f,
        name: m,
        value: r,
      })),
    }
  );
}
function w(e, t) {
  return (
    console.log('IMPORTING Workspace', e._id, e.name, JSON.stringify(e, null, 2)),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      model: 'workspace',
      name: e.name,
      variables: t,
    }
  );
}
function b(e, t) {
  return (
    console.log('IMPORTING FOLDER', e._id, e.name, JSON.stringify(e, null, 2)),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      folderId: e.parentId === t ? null : e.parentId,
      workspaceId: t,
      model: 'folder',
      name: e.name,
    }
  );
}
function T(e) {
  const t = JSON.parse(e);
  if (!d(t)) return;
  const { _type: i, __export_format: s } = t;
  if (i !== 'export' || s !== 4 || !Array.isArray(t.resources)) return;
  const n = {
      workspaces: [],
      requests: [],
      environments: [],
      folders: [],
    },
    p = t.resources.filter(g);
  for (const o of p) {
    console.log('IMPORTING WORKSPACE', o.name);
    const a = t.resources.find((r) => I(r) && r.parentId === o._id);
    console.log('FOUND BASE ENV', a.name),
      n.workspaces.push(w(o, a ? N(a.data) : [])),
      console.log('IMPORTING ENVIRONMENTS', a.name);
    const u = t.resources.filter((r) => I(r) && r.parentId === (a == null ? void 0 : a._id));
    console.log('FOUND', u.length, 'ENVIRONMENTS'),
      n.environments.push(...u.map((r) => O(r, o._id)));
    const m = (r) => {
      const f = t.resources.filter((l) => l.parentId === r);
      let S = 0;
      for (const l of f)
        y(l) ? (n.folders.push(b(l, o._id)), m(l._id)) : _(l) && n.requests.push(D(l, o._id, S++));
    };
    m(o._id);
  }
  return (
    (n.requests = n.requests.filter(Boolean)),
    (n.environments = n.environments.filter(Boolean)),
    (n.workspaces = n.workspaces.filter(Boolean)),
    n
  );
}
export { T as pluginHookImport };
