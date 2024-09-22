import { CallTemplateFunctionArgs, TemplateFunction } from '..';
import { Context } from './Context';

export type TemplateFunctionPlugin = TemplateFunction & {
  onRender(ctx: Context, args: CallTemplateFunctionArgs): Promise<string | null>;
};
