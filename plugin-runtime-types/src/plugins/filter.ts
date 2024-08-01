import { YaakContext } from './context';

export type FilterPluginResponse = string[];

export type FilterPlugin = {
  name: string;
  description?: string;
  canFilter(ctx: YaakContext, args: { mimeType: string }): Promise<boolean>;
  onFilter(
    ctx: YaakContext,
    args: { payload: string; mimeType: string },
  ): Promise<FilterPluginResponse>;
};
