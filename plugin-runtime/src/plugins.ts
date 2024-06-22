import * as fs from 'node:fs';
import path from 'node:path';
import { PluginHandle } from './PluginHandle';

export interface PluginInfo {
  name: string;
  root_dir: string;
  capabilities: ('import' | 'export' | 'filter')[];
}

export async function loadPlugins(): Promise<PluginHandle[]> {
  const pluginsDir = path.join(__dirname, '../../plugins');
  const pluginDirs = fs.readdirSync(pluginsDir).map((p) => path.join(pluginsDir, p));
  return Promise.all(
    pluginDirs.map(async (pluginDir) => {
      const handle = new PluginHandle(pluginDir);
      await handle.boot();
      return handle;
    }),
  );
}
