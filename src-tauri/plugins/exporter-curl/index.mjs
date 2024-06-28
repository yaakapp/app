const o = `\\
 `;
function y(p, t) {
  var f, r, u, l, s, c;
  const n = ["curl"];
  t.method && n.push("-X", t.method), t.url && n.push(i(t.url)), n.push(o);
  for (const a of (t.urlParameters ?? []).filter(h))
    n.push("--url-query", i(`${a.name}=${a.value}`)), n.push(o);
  for (const a of (t.headers ?? []).filter(h))
    n.push("--header", i(`${a.name}: ${a.value}`)), n.push(o);
  if (Array.isArray((f = t.body) == null ? void 0 : f.form)) {
    const a = t.bodyType === "multipart/form-data" ? "--form" : "--data";
    for (const e of (((r = t.body) == null ? void 0 : r.form) ?? []).filter(h)) {
      if (e.file) {
        let d = `${e.name}=@${e.file}`;
        d += e.contentType ? `;type=${e.contentType}` : "", n.push(a, d);
      } else
        n.push(a, i(`${e.name}=${e.value}`));
      n.push(o);
    }
  } else
    typeof ((u = t.body) == null ? void 0 : u.text) == "string" && (n.push("--data-raw", `$${i(t.body.text)}`), n.push(o));
  return (t.authenticationType === "basic" || t.authenticationType === "digest") && (t.authenticationType === "digest" && n.push("--digest"), n.push(
    "--user",
    i(`${((l = t.authentication) == null ? void 0 : l.username) ?? ""}:${((s = t.authentication) == null ? void 0 : s.password) ?? ""}`)
  ), n.push(o)), t.authenticationType === "bearer" && (n.push("--header", i(`Authorization: Bearer ${((c = t.authentication) == null ? void 0 : c.token) ?? ""}`)), n.push(o)), n[n.length - 1] === o && n.splice(n.length - 1, 1), n.join(" ");
}
function i(p) {
  return `'${p.replace(/'/g, "\\'")}'`;
}
function h(p) {
  return p.enabled !== !1 && !!p.name;
}
export {
  y as pluginHookExport
};
//# sourceMappingURL=index.mjs.map
