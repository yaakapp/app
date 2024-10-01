import {
  ShowPromptRequest,
  ShowPromptResponse,
  TemplateRenderRequest,
  TemplateRenderResponse,
} from '@yaakapp-internal/plugin';
import {
  FindHttpResponsesRequest,
  FindHttpResponsesResponse,
  GetHttpRequestByIdRequest,
  GetHttpRequestByIdResponse,
  RenderHttpRequestRequest,
  RenderHttpRequestResponse,
  SendHttpRequestRequest,
  SendHttpRequestResponse,
  ShowToastRequest,
} from '..';

export type Context = {
  clipboard: {
    copyText(text: string): void;
  };
  toast: {
    show(args: ShowToastRequest): void;
  };
  prompt: {
    show(args: ShowPromptRequest): Promise<ShowPromptResponse['value']>;
  };
  httpRequest: {
    send(args: SendHttpRequestRequest): Promise<SendHttpRequestResponse['httpResponse']>;
    getById(args: GetHttpRequestByIdRequest): Promise<GetHttpRequestByIdResponse['httpRequest']>;
    render(args: RenderHttpRequestRequest): Promise<RenderHttpRequestResponse['httpRequest']>;
  };
  httpResponse: {
    find(args: FindHttpResponsesRequest): Promise<FindHttpResponsesResponse['httpResponses']>;
  };
  templates: {
    render(args: TemplateRenderRequest): Promise<TemplateRenderResponse['data']>;
  };
};
