export class CaretError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaretError';
  }
}

export class CaretAPIError extends CaretError {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly error: any;
  readonly requestId?: string;

  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(message);
    this.name = 'CaretAPIError';
    this.status = status;
    this.error = error;
    this.headers = headers;
    this.requestId = headers['x-request-id'] || headers['X-Request-ID'];
  }

  static generate(status: number, error: any, message: string, headers: Record<string, string> = {}): CaretAPIError {
    const ErrorClass = this.getErrorClass(status);
    return new ErrorClass(status, error, message, headers);
  }

  private static getErrorClass(status: number) {
    switch (status) {
      case 400:
        return BadRequestError;
      case 401:
        return AuthenticationError;
      case 403:
        return PermissionDeniedError;
      case 404:
        return NotFoundError;
      case 409:
        return ConflictError;
      case 422:
        return UnprocessableEntityError;
      case 429:
        return RateLimitError;
      case 500:
        return InternalServerError;
      default:
        return CaretAPIError;
    }
  }
}

export class BadRequestError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'BadRequestError';
  }
}

export class AuthenticationError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'AuthenticationError';
  }
}

export class PermissionDeniedError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'PermissionDeniedError';
  }
}

export class NotFoundError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'UnprocessableEntityError';
  }
}

export class RateLimitError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends CaretAPIError {
  constructor(status: number, error: any, message: string, headers: Record<string, string> = {}) {
    super(status, error, message, headers);
    this.name = 'InternalServerError';
  }
}