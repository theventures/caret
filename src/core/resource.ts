import type { Caret } from '../client.js';

export abstract class APIResource {
  protected _client: Caret;

  constructor(client: Caret) {
    this._client = client;
  }
}