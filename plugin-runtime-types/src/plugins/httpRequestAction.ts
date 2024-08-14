import { CallHttpRequestActionArgs } from '../gen/CallHttpRequestActionArgs';
import { HttpRequestAction } from '../gen/HttpRequestAction';
import { YaakContext } from './context';

export type HttpRequestActionPlugin = HttpRequestAction & {
  onSelect(ctx: YaakContext, args: CallHttpRequestActionArgs): Promise<void> | void;
};
