import { GetHttpRequestByIdRequest } from '../gen/GetHttpRequestByIdRequest';
import { GetHttpRequestByIdResponse } from '../gen/GetHttpRequestByIdResponse';
import { SendHttpRequestRequest } from '../gen/SendHttpRequestRequest';
import { SendHttpRequestResponse } from '../gen/SendHttpRequestResponse';

export type YaakContext = {
  clipboard: {
    copyText(text: string): void;
  };
  httpRequest: {
    send(args: SendHttpRequestRequest): Promise<SendHttpRequestResponse['httpResponse']>;
    getById(args: GetHttpRequestByIdRequest): Promise<GetHttpRequestByIdResponse['httpRequest']>;
  };
};
