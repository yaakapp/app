import { HttpRequest } from '../models';
import { YaakContext } from './context';

export type HttpRequestActionPlugin = {
  key: string;
  label: string;
  onSelect(ctx: YaakContext, args: { httpRequest: HttpRequest }): void;
};
