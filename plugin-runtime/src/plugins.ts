import * as fs from 'node:fs';
import path from 'node:path';
import { loadPlugin } from './load-plugin';

export interface PluginInfo {
  name: string;
  root_dir: string;
  capabilities: ('import' | 'export' | 'filter')[];
}

export async function loadPlugins(): Promise<PluginInfo[]> {
  const pluginsDir = path.join(__dirname, '../../plugins');
  const pluginDirs = fs.readdirSync(pluginsDir).map((p) => path.join(pluginsDir, p));
  return Promise.all(pluginDirs.map((d) => loadPlugin(d)));
}
