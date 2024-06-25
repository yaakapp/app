import { PluginHandle } from './PluginHandle';
import { loadPlugins, PluginInfo } from './plugins';

export class PluginManager {
  #handles: PluginHandle[] | null = null;
  static #instance: PluginManager | null = null;

  public static instance(): PluginManager {
    PluginManager.#instance = new PluginManager();
    return PluginManager.#instance;
  }

  async plugins(): Promise<PluginHandle[]> {
    this.#handles = this.#handles ?? loadPlugins();
    return this.#handles;
  }

  async pluginsWith(capability: PluginInfo['capabilities'][0]): Promise<PluginHandle[]> {
    const plugins = await this.plugins();
    const pluginsWithInfo = await Promise.all(
      plugins.map(async (plugin) => ({ plugin, info: await plugin.getInfo() })),
    );
    return pluginsWithInfo
      .filter((v) => v.info.capabilities.includes(capability))
      .map((v) => v.plugin);
  }

  async plugin(name: string): Promise<PluginHandle | null> {
    const plugins = await this.plugins();
    for (const plugin of plugins) {
      const info = await plugin.getInfo();
      if (info.name === name) {
        return plugin;
      }
    }

    return null;
  }

  async pluginOrThrow(name: string): Promise<PluginHandle> {
    const plugin = await this.plugin(name);
    if (plugin == null) {
      throw new Error(`Failed to find plugin by ${name}`);
    }

    return plugin;
  }
}
