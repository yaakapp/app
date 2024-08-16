import { FilterPlugin } from './filter';
import { HttpRequestActionPlugin } from './httpRequestAction';
import { ImporterPlugin } from './import';
import { ThemePlugin } from './theme';

export type { YaakContext } from './context';

/**
 * The global structure of a Yaak plugin
 */
export type YaakPlugin = {
  importer?: ImporterPlugin;
  theme?: ThemePlugin;
  filter?: FilterPlugin;
  httpRequestActions?: HttpRequestActionPlugin[];
};
