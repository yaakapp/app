import { SingleOrArray } from '../helpers';
import { ImporterPlugin } from './import';
import { ThemePlugin } from './theme';

/**
 * The global structure of a Yaak plugin
 */
export type YaakPlugin = {
  /** One or many plugins to import data into Yaak */
  importers?: SingleOrArray<ImporterPlugin>;
  /** One or many themes to customize the Yaak UI */
  themes?: SingleOrArray<ThemePlugin>;
};
