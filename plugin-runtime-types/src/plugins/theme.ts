import { Theme } from '../themes';
import { YaakContext } from './context';

export interface ThemePlugin {
  name: string;
  description?: string;
  getTheme(ctx: YaakContext, fileContents: string): Promise<Theme>;
}
