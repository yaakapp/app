import { HttpRequest, HttpResponse } from '../models';

export type YaakContext = {
  metadata: {
    getVersion(): Promise<string>;
  };
  httpRequest: {
    send(id: string): Promise<HttpResponse>;
    getById(id: string): Promise<HttpRequest | null>;
  };
};
