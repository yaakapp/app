import { PluginHandle } from './PluginHandle';
import { loadPlugins, PluginInfo } from './plugins';

export class PluginManager {
  #handles: PluginHandle[] | null = null;

  async plugins(): Promise<PluginHandle[]> {
    this.#handles = this.#handles ?? loadPlugins();
    return this.#handles;
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
