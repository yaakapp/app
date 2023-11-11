function S(e, t) {
  return (
    console.log('IMPORTING Environment', e._id, e.name, JSON.stringify(e, null, 2)),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      workspaceId: t,
      model: 'environment',
      name: e.name,
      variables: Object.entries(e.data).map(([n, a]) => ({
        enabled: !0,
        name: n,
        value: `${a}`,
      })),
    }
  );
}
function I(e) {
  return m(e) && e._type === 'workspace';
}
function y(e) {
  return m(e) && e._type === 'request_group';
}
function g(e) {
  return m(e) && e._type === 'request';
}
function f(e) {
  return m(e) && e._type === 'environment';
}
function m(e) {
  return Object.prototype.toString.call(e) === '[object Object]';
}
function w(e) {
  return Object.prototype.toString.call(e) === '[object String]';
}
function O(e) {
  return Object.entries(e).map(([t, n]) => ({
    enabled: !0,
    name: t,
    value: `${n}`,
  }));
}
function l(e) {
  return w(e) ? e.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}') : e;
}
function h(e, t, n = 0) {
  var c, o;
  console.log('IMPORTING REQUEST', e._id, e.name, JSON.stringify(e, null, 2));
  let a = null,
    r = null;
  ((c = e.body) == null ? void 0 : c.mimeType) === 'application/graphql'
    ? ((a = 'graphql'), (r = l(e.body.text)))
    : ((o = e.body) == null ? void 0 : o.mimeType) === 'application/json' &&
      ((a = 'application/json'), (r = l(e.body.text)));
  let i = null,
    u = {};
  return (
    e.authentication.type === 'bearer'
      ? ((i = 'bearer'),
        (u = {
          token: l(e.authentication.token),
        }))
      : e.authentication.type === 'basic' &&
        ((i = 'basic'),
        (u = {
          username: l(e.authentication.username),
          password: l(e.authentication.password),
        })),
    {
      id: e._id,
      createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
      workspaceId: t,
      folderId: e.parentId === t ? null : e.parentId,
      model: 'http_request',
      sortPriority: n,
      name: e.name,
      url: l(e.url),
      body: r,
      bodyType: a,
      authentication: u,
      authenticationType: i,
      method: e.method,
      headers: (e.headers ?? [])
        .map(({ name: d, value: p, disabled: s }) => ({
          enabled: !s,
          name: d,
          value: p,
        }))
        .filter(({ name: d, value: p }) => d !== '' || p !== ''),
    }
  );
}
function _(e, t) {
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
function b(e) {
  console.log('RUNNING INSOMNIA');
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return;
  }
  if (!m(t) || !Array.isArray(t.resources)) return;
  const n = {
      workspaces: [],
      requests: [],
      environments: [],
      folders: [],
    },
    a = t.resources.filter(I);
  for (const r of a) {
    const i = t.resources.find((o) => f(o) && o.parentId === r._id);
    n.workspaces.push({
      id: r._id,
      createdAt: new Date(a.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(a.updated ?? Date.now()).toISOString().replace('Z', ''),
      model: 'workspace',
      name: r.name,
      variables: i ? O(i.data) : [],
    });
    const u = t.resources.filter((o) => f(o) && o.parentId === (i == null ? void 0 : i._id));
    n.environments.push(...u.map((o) => S(o, r._id)));
    const c = (o) => {
      const d = t.resources.filter((s) => s.parentId === o);
      let p = 0;
      for (const s of d)
        y(s) ? (n.folders.push(_(s, r._id)), c(s._id)) : g(s) && n.requests.push(h(s, r._id, p++));
    };
    c(r._id);
  }
  return (
    (n.requests = n.requests.filter(Boolean)),
    (n.environments = n.environments.filter(Boolean)),
    (n.workspaces = n.workspaces.filter(Boolean)),
    { resources: n }
  );
}
export { b as pluginHookImport };
