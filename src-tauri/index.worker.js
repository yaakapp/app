'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
);

// src/index.worker.ts
var import_node_path = __toESM(require('node:path'));
var import_node_worker_threads = require('node:worker_threads');
if (!import_node_worker_threads.isMainThread) {
  new Promise(async () => {
    const { pluginDir } = import_node_worker_threads.workerData;
    const pluginEntrypoint = import_node_path.default.join(pluginDir, 'src/index.ts');
    const pluginPackageJson = import_node_path.default.join(pluginDir, 'package.json');
    const packageJson = await import(pluginPackageJson, { assert: { type: 'json' } });
    const mod = await import(pluginEntrypoint);
    const info = {
      capabilities: [],
      name: packageJson['name'] ?? 'n/a',
      dir: pluginDir,
    };
    if (typeof mod['pluginHookImport'] === 'function') {
      info.capabilities.push('import');
    }
    if (typeof mod['pluginHookExport'] === 'function') {
      info.capabilities.push('export');
    }
    if (typeof mod['pluginHookResponseFilter'] === 'function') {
      info.capabilities.push('filter');
    }
    delete require.cache[pluginEntrypoint];
    function reply(originalMsg, payload) {
      import_node_worker_threads.parentPort.postMessage({
        payload,
        callbackId: originalMsg.callbackId,
      });
    }
    function replyErr(originalMsg, error) {
      import_node_worker_threads.parentPort.postMessage({
        error: String(error),
        callbackId: originalMsg.callbackId,
      });
    }
    import_node_worker_threads.parentPort.on('message', (msg) => {
      try {
        switch (msg.name) {
          case 'run-import':
            reply(msg, mod['pluginHookImport']({}, msg.payload));
            break;
          case 'run-filter':
            reply(msg, mod['pluginHookResponseFilter']({}, msg.payload));
            break;
          case 'info':
            reply(msg, info);
            break;
          default:
            console.log('Unknown message', msg);
        }
      } catch (err) {
        replyErr(msg, err);
      }
    });
  }).catch((err) => console.log('failed to boot plugin', err));
}
