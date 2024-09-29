"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  pluginHookImport: () => pluginHookImport
});
module.exports = __toCommonJS(src_exports);
function pluginHookImport(_ctx, contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (err) {
    return void 0;
  }
  if (!isJSObject(parsed)) {
    return void 0;
  }
  const isYaakExport = "yaakSchema" in parsed;
  if (!isYaakExport) {
    return;
  }
  if ("requests" in parsed.resources) {
    parsed.resources.httpRequests = parsed.resources.requests;
    delete parsed.resources["requests"];
  }
  return { resources: parsed.resources };
}
function isJSObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  pluginHookImport
});
