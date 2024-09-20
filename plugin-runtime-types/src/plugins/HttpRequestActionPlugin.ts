import { CallHttpRequestActionArgs, HttpRequestAction } from '../gen/events';
import { Context } from './Context';

export type HttpRequestActionPlugin = HttpRequestAction & {
  onSelect(ctx: Context, args: CallHttpRequestActionArgs): Promise<void> | void;
};
