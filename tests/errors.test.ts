import { describe, test, expect } from 'bun:test';
import {
  CaretError,
  CaretAPIError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError
} from '../src/core/errors.js';

describe('Error Classes', () => {
  describe('CaretError', () => {
    test('should create error with correct name and message', () => {
      const error = new CaretError('Test error message');
      expect(error.name).toBe('CaretError');
      expect(error.message).toBe('Test error message');
      expect(error).toBeInstanceOf(Error);
    }) as any;
  }) as any;

  describe('CaretAPIError', () => {
    test('should create error with all properties', () => {
      const errorData = { code: 'INVALID_REQUEST', details: 'Missing field' };
      const headers = { 'x-request-id': 'req-123', 'content-type': 'application/json' };
      const error = new CaretAPIError(400, errorData, 'Bad request', headers);

      expect(error.name).toBe('CaretAPIError');
      expect(error.message).toBe('Bad request');
      expect(error.status).toBe(400);
      expect(error.error).toEqual(errorData);
      expect(error.headers).toEqual(headers);
      expect(error.requestId).toBe('req-123');
      expect(error).toBeInstanceOf(CaretError);
    }) as any;

    test('should extract request ID from X-Request-ID header', () => {
      const headers = { 'X-Request-ID': 'req-uppercase-123' };
      const error = new CaretAPIError(500, {}, 'Server error', headers);
      expect(error.requestId).toBe('req-uppercase-123');
    }) as any;

    test('should handle missing request ID header', () => {
      const headers = { 'content-type': 'application/json' };
      const error = new CaretAPIError(404, {}, 'Not found', headers);
      expect(error.requestId).toBeUndefined();
    }) as any;

    test('should handle empty headers', () => {
      const error = new CaretAPIError(500, {}, 'Server error');
      expect(error.headers).toEqual({}) as any;
      expect(error.requestId).toBeUndefined();
    }) as any;
  }) as any;

  describe('CaretAPIError.generate()', () => {
    test('should generate BadRequestError for status 400', () => {
      const error = CaretAPIError.generate(400, { message: 'Bad request' }, 'Bad request');
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.status).toBe(400);
      expect(error.name).toBe('BadRequestError');
    }) as any;

    test('should generate AuthenticationError for status 401', () => {
      const error = CaretAPIError.generate(401, { message: 'Unauthorized' }, 'Unauthorized');
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.status).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    }) as any;

    test('should generate PermissionDeniedError for status 403', () => {
      const error = CaretAPIError.generate(403, { message: 'Forbidden' }, 'Forbidden');
      expect(error).toBeInstanceOf(PermissionDeniedError);
      expect(error.status).toBe(403);
      expect(error.name).toBe('PermissionDeniedError');
    }) as any;

    test('should generate NotFoundError for status 404', () => {
      const error = CaretAPIError.generate(404, { message: 'Not found' }, 'Not found');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.status).toBe(404);
      expect(error.name).toBe('NotFoundError');
    }) as any;

    test('should generate ConflictError for status 409', () => {
      const error = CaretAPIError.generate(409, { message: 'Conflict' }, 'Conflict');
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.status).toBe(409);
      expect(error.name).toBe('ConflictError');
    }) as any;

    test('should generate UnprocessableEntityError for status 422', () => {
      const error = CaretAPIError.generate(422, { message: 'Unprocessable' }, 'Unprocessable');
      expect(error).toBeInstanceOf(UnprocessableEntityError);
      expect(error.status).toBe(422);
      expect(error.name).toBe('UnprocessableEntityError');
    }) as any;

    test('should generate RateLimitError for status 429', () => {
      const error = CaretAPIError.generate(429, { message: 'Rate limited' }, 'Rate limited');
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.status).toBe(429);
      expect(error.name).toBe('RateLimitError');
    }) as any;

    test('should generate InternalServerError for status 500', () => {
      const error = CaretAPIError.generate(500, { message: 'Server error' }, 'Server error');
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.status).toBe(500);
      expect(error.name).toBe('InternalServerError');
    }) as any;

    test('should generate generic CaretAPIError for unknown status codes', () => {
      const error = CaretAPIError.generate(418, { message: 'Teapot' }, "I'm a teapot");
      expect(error).toBeInstanceOf(CaretAPIError);
      expect(error.constructor).toBe(CaretAPIError);
      expect(error.status).toBe(418);
      expect(error.name).toBe('CaretAPIError');
    }) as any;

    test('should preserve error data and headers', () => {
      const errorData = { code: 'VALIDATION_ERROR', fields: ['email', 'name'] };
      const headers = { 'x-request-id': 'req-456', 'retry-after': '60' };
      const error = CaretAPIError.generate(422, errorData, 'Validation failed', headers);

      expect(error.error).toEqual(errorData);
      expect(error.headers).toEqual(headers);
      expect(error.requestId).toBe('req-456');
    }) as any;
  }) as any;

  describe('Specific Error Classes', () => {
    test('BadRequestError should have correct name', () => {
      const error = new BadRequestError(400, {}, 'Bad request');
      expect(error.name).toBe('BadRequestError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('AuthenticationError should have correct name', () => {
      const error = new AuthenticationError(401, {}, 'Unauthorized');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('PermissionDeniedError should have correct name', () => {
      const error = new PermissionDeniedError(403, {}, 'Forbidden');
      expect(error.name).toBe('PermissionDeniedError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('NotFoundError should have correct name', () => {
      const error = new NotFoundError(404, {}, 'Not found');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('ConflictError should have correct name', () => {
      const error = new ConflictError(409, {}, 'Conflict');
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('UnprocessableEntityError should have correct name', () => {
      const error = new UnprocessableEntityError(422, {}, 'Unprocessable');
      expect(error.name).toBe('UnprocessableEntityError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('RateLimitError should have correct name', () => {
      const error = new RateLimitError(429, {}, 'Rate limited');
      expect(error.name).toBe('RateLimitError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('InternalServerError should have correct name', () => {
      const error = new InternalServerError(500, {}, 'Server error');
      expect(error.name).toBe('InternalServerError');
      expect(error).toBeInstanceOf(CaretAPIError);
    }) as any;

    test('all specific errors should preserve all properties', () => {
      const errorData = { details: 'test error' };
      const headers = { 'x-request-id': 'req-789' };
      const message = 'Test message';

      const errors = [
        new BadRequestError(400, errorData, message, headers),
        new AuthenticationError(401, errorData, message, headers),
        new PermissionDeniedError(403, errorData, message, headers),
        new NotFoundError(404, errorData, message, headers),
        new ConflictError(409, errorData, message, headers),
        new UnprocessableEntityError(422, errorData, message, headers),
        new RateLimitError(429, errorData, message, headers),
        new InternalServerError(500, errorData, message, headers)
      ];

      errors.forEach(error => {
        expect(error.message).toBe(message);
        expect(error.error).toEqual(errorData);
        expect(error.headers).toEqual(headers);
        expect(error.requestId).toBe('req-789');
      }) as any;
    }) as any;
  }) as any;
}) as any;