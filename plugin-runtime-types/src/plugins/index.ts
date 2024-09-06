import { FilterPlugin } from './FilterPlugin';
import { HttpRequestActionPlugin } from './HttpRequestActionPlugin';
import { ImporterPlugin } from './ImporterPlugin';
import { TemplateFunctionPlugin } from './TemplateFunctionPlugin';
import { ThemePlugin } from './ThemePlugin';

export type { Context } from './Context';

/**
 * The global structure of a Yaak plugin
 */
export type PluginDefinition = {
  importer?: ImporterPlugin;
  theme?: ThemePlugin;
  filter?: FilterPlugin;
  httpRequestActions?: HttpRequestActionPlugin[];
  templateFunctions?: TemplateFunctionPlugin[];
};
