import { CallHttpRequestActionArgs, HttpRequestAction } from '..';
import { Context } from './Context';

export type HttpRequestActionPlugin = HttpRequestAction & {
  onSelect(ctx: Context, args: CallHttpRequestActionArgs): Promise<void> | void;
};
