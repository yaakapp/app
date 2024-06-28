import { existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getAsset, isSea } from 'node:sea';
import { PluginHandle } from './PluginHandle';
import { loadPlugins, PluginInfo } from './plugins';

export class PluginManager {
  #handles: PluginHandle[] | null = null;
  static #instance: PluginManager | null = null;

  public static instance(): PluginManager {
    if (PluginManager.#instance == null) {
      PluginManager.#instance = new PluginManager();
      PluginManager.#instance.plugins(); // Trigger workers to boot, as it takes a few seconds
    }
    return PluginManager.#instance;
  }

  async plugins(): Promise<PluginHandle[]> {
    await this.#ensureWorkerForSea();
    this.#handles = this.#handles ?? loadPlugins();
    return this.#handles;
  }

  /**
   * Copy worker JS asset to filesystem if we're in single-executable-application (SEA)
   * @private
   */
  async #ensureWorkerForSea() {
    if (!isSea()) return;

    const assetPath = path.resolve(tmpdir(), 'index.worker.js');
    if (existsSync(assetPath)) return;

    console.log('Writing worker file to', assetPath);
    writeFileSync(assetPath, getAsset('worker', 'utf8'));
  }

  async #pluginsWithInfo(): Promise<{ plugin: PluginHandle; info: PluginInfo }[]> {
    const plugins = await this.plugins();
    return Promise.all(plugins.map(async (plugin) => ({ plugin, info: await plugin.getInfo() })));
  }

  async pluginsWith(capability: PluginInfo['capabilities'][0]): Promise<PluginHandle[]> {
    return (await this.#pluginsWithInfo())
      .filter((v) => v.info.capabilities.includes(capability))
      .map((v) => v.plugin);
  }

  async plugin(name: string): Promise<PluginHandle | null> {
    return (await this.#pluginsWithInfo()).find((v) => v.info.name === name)?.plugin ?? null;
  }

  async pluginOrThrow(name: string): Promise<PluginHandle> {
    const plugin = await this.plugin(name);
    if (plugin == null) {
      throw new Error(`Failed to find plugin by ${name}`);
    }

    return plugin;
  }
}
