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
  plugin: () => plugin
});
module.exports = __toCommonJS(src_exports);
var plugin = {
  templateFunctions: [
    {
      name: "request.body",
      args: [],
      async onRender(ctx, args) {
        const httpRequest = await ctx.httpRequest.getById({ id: args.values.request ?? "n/a" });
        if (httpRequest == null) return null;
        const rendered = await ctx.httpRequest.render({ httpRequest, purpose: args.purpose });
        return rendered.body.text ?? "";
      }
    },
    {
      name: "request.header",
      args: [
        {
          name: "requestId",
          label: "Http Request",
          type: "http_request"
        },
        {
          name: "header",
          label: "Header Name",
          type: "text"
        }
      ],
      async onRender(ctx, args) {
        const httpRequest = await ctx.httpRequest.getById({ id: args.values.requestId ?? "n/a" });
        if (httpRequest == null) return null;
        const rendered = await ctx.httpRequest.render({ httpRequest, purpose: args.purpose });
        return rendered.headers.find((h) => h.name.toLowerCase() === args.values.header?.toLowerCase())?.value ?? "";
      }
    }
  ]
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  plugin
});
