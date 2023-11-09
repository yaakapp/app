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
  return m(e) && e._type === 'workspace';
}
function y(e) {
  return m(e) && e._type === 'request_group';
}
function _(e) {
  return m(e) && e._type === 'request';
}
function I(e) {
  return m(e) && e._type === 'environment';
}
function m(e) {
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
function p(e) {
  return h(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}') : e;
}
function D(e, t, i = 0) {
  var a, d;
  console.log('IMPORTING REQUEST', e._id, e.name, JSON.stringify(e, null, 2));
  let s = null,
    n = null;
  ((a = e.body) == null ? void 0 : a.mimeType) === 'application/graphql'
    ? ((s = 'graphql'), (n = p(e.body.text)))
    : ((d = e.body) == null ? void 0 : d.mimeType) === 'application/json' &&
      ((s = 'application/json'), (n = p(e.body.text)));
  let u = null,
    r = {};
  return (
    e.authentication.type === 'bearer'
      ? ((u = 'bearer'),
        (r = {
          token: p(e.authentication.token),
        }))
      : e.authentication.type === 'basic' &&
        ((u = 'basic'),
        (r = {
          username: p(e.authentication.username),
          password: p(e.authentication.password),
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
      url: p(e.url),
      body: n,
      bodyType: s,
      authentication: r,
      authenticationType: u,
      method: e.method,
      headers: (e.headers ?? [])
        .map(({ name: c, value: o, disabled: f }) => ({
          enabled: !f,
          name: c,
          value: o,
        }))
        .filter(({ name: c, value: o }) => c !== '' || o !== ''),
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
  if (!m(t)) return;
  const { _type: i, __export_format: s } = t;
  if (i !== 'export' || s !== 4 || !Array.isArray(t.resources)) return;
  const n = {
      workspaces: [],
      requests: [],
      environments: [],
      folders: [],
    },
    u = t.resources.filter(g);
  for (const r of u) {
    console.log('IMPORTING WORKSPACE', r.name);
    const a = t.resources.find((o) => I(o) && o.parentId === r._id);
    console.log('FOUND BASE ENV', a.name),
      n.workspaces.push(w(r, a ? N(a.data) : [])),
      console.log('IMPORTING ENVIRONMENTS', a.name);
    const d = t.resources.filter((o) => I(o) && o.parentId === (a == null ? void 0 : a._id));
    console.log('FOUND', d.length, 'ENVIRONMENTS'),
      n.environments.push(...d.map((o) => O(o, r._id)));
    const c = (o) => {
      const f = t.resources.filter((l) => l.parentId === o);
      let S = 0;
      for (const l of f)
        y(l) ? (n.folders.push(b(l, r._id)), c(l._id)) : _(l) && n.requests.push(D(l, r._id, S++));
    };
    c(r._id);
  }
  return (
    (n.requests = n.requests.filter(Boolean)),
    (n.environments = n.environments.filter(Boolean)),
    (n.workspaces = n.workspaces.filter(Boolean)),
    n
  );
}
export { T as pluginHookImport };
