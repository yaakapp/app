import { HttpRequest } from '../gen/models/HttpRequest';
import { HttpResponse } from '../gen/models/HttpResponse';

export type YaakContext = {
  metadata: {
    getVersion(): Promise<string>;
  };
  httpRequest: {
    send(id: string): Promise<HttpResponse>;
    getById(id: string): Promise<HttpRequest | null>;
  };
};
