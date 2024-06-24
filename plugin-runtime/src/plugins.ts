import * as fs from 'node:fs';
import path from 'node:path';
import { PluginHandle } from './PluginHandle';

export interface PluginInfo {
  name: string;
  dir: string;
  capabilities: ('import' | 'export' | 'filter')[];
}

export function loadPlugins(): PluginHandle[] {
  const pluginsDir = path.join(__dirname, '../../plugins');
  const pluginDirs = fs.readdirSync(pluginsDir).map((p) => path.join(pluginsDir, p));
  return pluginDirs.map((pluginDir) => new PluginHandle(pluginDir));
}
