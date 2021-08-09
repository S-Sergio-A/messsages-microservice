export class ValidationException extends Error {
  public response: { [key: string]: { readonly key: string; readonly code: number; readonly message: string } };

  constructor(public readonly error: { [key: string]: any }, ...args) {
    super(...args);
    this.response = error;
  }
}
