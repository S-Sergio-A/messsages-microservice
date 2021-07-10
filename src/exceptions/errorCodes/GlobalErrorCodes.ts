export class GlobalErrorCodes {
  static readonly INTERNAL_ERROR = new GlobalErrorCodes("INTERNAL_ERROR", 600, "Internal Failure!");
  static readonly EMPTY_ERROR = new GlobalErrorCodes("EMPTY_ERROR", 601, "This field mustn't be empty.");
  static readonly NO_USER_ID = new GlobalErrorCodes("NO_USER_ID", 602, "User ID is not provided!");

  private constructor(private readonly key: string, public readonly code: number, public readonly value: string) {}

  toString() {
    return this.key;
  }
}
