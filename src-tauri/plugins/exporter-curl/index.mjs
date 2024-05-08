const o = `\\
 `;
function d(n) {
  var h, f, r, u, l, s;
  const t = ["curl"];
  n.method && t.push("-X", n.method), n.url && t.push(i(n.url)), t.push(o);
  for (const a of (n.urlParameters ?? []).filter(p))
    t.push("--url-query", i(`${a.name}=${a.value}`)), t.push(o);
  for (const a of (n.headers ?? []).filter(p))
    t.push("--header", i(`${a.name}: ${a.value}`)), t.push(o);
  if (Array.isArray((h = n.body) == null ? void 0 : h.form)) {
    const a = n.bodyType === "multipart/form-data" ? "--form" : "--data";
    for (const e of (((f = n.body) == null ? void 0 : f.form) ?? []).filter(p)) {
      if (e.file) {
        let c = `${e.name}=@${e.file}`;
        c += e.contentType ? `;type=${e.contentType}` : "", t.push(a, c);
      } else
        t.push(a, i(`${e.name}=${e.value}`));
      t.push(o);
    }
  } else
    typeof ((r = n.body) == null ? void 0 : r.text) == "string" && (t.push("--data-raw", `$${i(n.body.text)}`), t.push(o));
  return (n.authenticationType === "basic" || n.authenticationType === "digest") && (n.authenticationType === "digest" && t.push("--digest"), t.push(
    "--user",
    i(`${((u = n.authentication) == null ? void 0 : u.username) ?? ""}:${((l = n.authentication) == null ? void 0 : l.password) ?? ""}`)
  ), t.push(o)), n.authenticationType === "bearer" && (t.push("--header", i(`Authorization: Bearer ${((s = n.authentication) == null ? void 0 : s.token) ?? ""}`)), t.push(o)), t[t.length - 1] === o && t.splice(t.length - 1, 1), t.join(" ");
}
function i(n) {
  return `'${n.replace(/'/g, "\\'")}'`;
}
function p(n) {
  return n.enabled !== !1 && !!n.name;
}
export {
  d as pluginHookExport
};
