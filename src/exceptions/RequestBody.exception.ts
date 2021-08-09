export class RequestBodyException extends Error {
  public response: { key: string; code: number; message: string };

  constructor(public readonly errors: { readonly key: string; readonly code: number; readonly message: string }, ...args) {
    super(...args);
    this.response = { key: errors.key, code: errors.code, message: errors.message };
  }
}
