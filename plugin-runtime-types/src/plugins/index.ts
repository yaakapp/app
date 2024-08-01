import { OneOrMany } from '../helpers';
import { FilterPlugin } from './filter';
import { HttpRequestActionPlugin } from './httpRequestAction';
import { ImporterPlugin } from './import';
import { ThemePlugin } from './theme';

/**
 * The global structure of a Yaak plugin
 */
export type YaakPlugin = {
  importer?: OneOrMany<ImporterPlugin>;
  theme?: OneOrMany<ThemePlugin>;
  filter?: OneOrMany<FilterPlugin>;
  httpRequestAction?: OneOrMany<HttpRequestActionPlugin>;
};
