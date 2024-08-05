import * as fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { PluginHandle } from './PluginHandle';

export interface PluginInfo {
  name: string;
  dir: string;
  capabilities: ('import' | 'export' | 'filter')[];
}

export function loadPlugins(): PluginHandle[] {
  const pluginsDir = process.env.YAAK_PLUGINS_DIR;
  if (!pluginsDir) throw new Error('YAAK_PLUGINS_DIR is not set');
  console.log('Loading plugins from', pluginsDir);

  const pluginDirs = fs.readdirSync(pluginsDir).map((p) => path.join(pluginsDir, p));
  return pluginDirs.map((pluginDir) => new PluginHandle(pluginDir));
}

export function bootPlugin(pluginDir: string) {
  const workerPath = path.join(__dirname, 'index.worker.cjs');
  const worker = new Worker(workerPath, {
    workerData: { pluginDir },
  });

  worker.on('error', (err: Error) => {
    console.error('Plugin errored', err);
  });
  worker.on('exit', (code: number) => {
    if (code === 0) {
      console.log('Plugin exited successfully', pluginDir);
    } else {
      console.log('Plugin exited with error', code, pluginDir);
    }
  });
}
