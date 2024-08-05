import { HttpRequest } from '../gen/HttpRequest';
import { HttpResponse } from '../gen/HttpResponse';

export type YaakContext = {
  metadata: {
    getVersion(): Promise<string>;
  };
  httpRequest: {
    send(id: string): Promise<HttpResponse>;
    getById(id: string): Promise<HttpRequest | null>;
  };
};
