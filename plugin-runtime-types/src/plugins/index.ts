export * from './filter';
export * from './httpRequestAction';
export * from './import';
export * from './context';

import { DataFilterPlugin } from './filter';
import { HttpRequestActionPlugin } from './httpRequestAction';
import { FileImportPlugin } from './import';

/**
 * The global structure of a Yaak plugin
 */
export interface YaakPlugin {
  fileImport?: FileImportPlugin;
  // theme?: ThemePlugin;
  dataFilter?: DataFilterPlugin;
  httpRequestAction?: HttpRequestActionPlugin;
}
