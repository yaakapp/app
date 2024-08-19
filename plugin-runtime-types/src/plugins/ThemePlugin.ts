import { Theme } from '../themes';
import { Context } from './Context';

export type ThemePlugin = {
  name: string;
  description?: string;
  getTheme(ctx: Context, fileContents: string): Promise<Theme>;
};
