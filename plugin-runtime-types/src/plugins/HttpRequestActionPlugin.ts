import { CallHttpRequestActionArgs } from '../gen/CallHttpRequestActionArgs';
import { HttpRequestAction } from '../gen/HttpRequestAction';
import { Context } from './Context';

export type HttpRequestActionPlugin = HttpRequestAction & {
  onSelect(ctx: Context, args: CallHttpRequestActionArgs): Promise<void> | void;
};
