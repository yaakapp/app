import { HttpRequest } from '../models';
import { YaakContext } from './context';

export interface HttpRequestActionPlugin {
  key: string;
  label: string;

  onSelect(ctx: YaakContext, args: { httpRequest: HttpRequest }): void;
}
