import { CallTemplateFunctionArgs } from '../gen/CallTemplateFunctionArgs';
import { TemplateFunction } from '../gen/TemplateFunction';
import { Context } from './Context';

export type TemplateFunctionPlugin = TemplateFunction & {
  onRender(ctx: Context, args: CallTemplateFunctionArgs): Promise<string | null>;
};
