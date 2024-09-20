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
} from '../gen/events';

export type Context = {
  clipboard: {
    copyText(text: string): void;
  };
  toast: {
    show(args: ShowToastRequest): void;
  };
  httpRequest: {
    send(args: SendHttpRequestRequest): Promise<SendHttpRequestResponse['httpResponse']>;
    getById(args: GetHttpRequestByIdRequest): Promise<GetHttpRequestByIdResponse['httpRequest']>;
    render(args: RenderHttpRequestRequest): Promise<RenderHttpRequestResponse['httpRequest']>;
  };
  httpResponse: {
    find(args: FindHttpResponsesRequest): Promise<FindHttpResponsesResponse['httpResponses']>;
  };
};
