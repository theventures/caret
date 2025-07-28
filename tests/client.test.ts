import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Caret, type CaretOptions } from '../src/client.js';
import { CaretAPIError, AuthenticationError } from '../src/core/errors.js';
import { 
  createMockResponse, 
  createMockErrorResponse
} from './__helpers__/mocks.js';

describe('Caret Client', () => {
  let originalFetch: typeof globalThis.fetch;
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalEnv = process.env;
    process.env = { ...originalEnv };
  }) as any;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  }) as any;

  describe('Constructor', () => {
    test('should create client with API key from options', () => {
      const client = new Caret({ apiKey: 'sk-test-key' }) as any;
      expect(client.apiKey).toBe('sk-test-key');
    }) as any;

    test('should create client with API key from environment variable', () => {
      process.env.CARET_API_KEY = 'sk-env-key';
      const client = new Caret();
      expect(client.apiKey).toBe('sk-env-key');
    }) as any;

    test('should prefer options API key over environment variable', () => {
      process.env.CARET_API_KEY = 'sk-env-key';
      const client = new Caret({ apiKey: 'sk-options-key' }) as any;
      expect(client.apiKey).toBe('sk-options-key');
    }) as any;

    test('should throw error when no API key provided', () => {
      delete process.env.CARET_API_KEY;
      expect(() => new Caret()).toThrow('API key is required');
    }) as any;

    test('should set default configuration values', () => {
      const client = new Caret({ apiKey: 'sk-test-key' }) as any;
      expect(client.baseURL).toBe('https://api.caret.so/v1');
      expect(client.timeout).toBe(30000);
      expect(client.maxRetries).toBe(3);
    }) as any;

    test('should use custom configuration values', () => {
      const options: CaretOptions = {
        apiKey: 'sk-test-key',
        baseURL: 'https://custom.api.com/v2',
        timeout: 60000,
        maxRetries: 5
      };
      const client = new Caret(options);
      expect(client.baseURL).toBe('https://custom.api.com/v2');
      expect(client.timeout).toBe(60000);
      expect(client.maxRetries).toBe(5);
    }) as any;

    test('should initialize notes resource', () => {
      const client = new Caret({ apiKey: 'sk-test-key' }) as any;
      expect(client.notes).toBeDefined();
    }) as any;
  }) as any;

  describe('Request Method', () => {
    let client: Caret;

    beforeEach(() => {
      client = new Caret({ apiKey: 'sk-test-key' }) as any;
    }) as any;

    test('should make successful GET request', async () => {
      const responseData = { message: 'success' };
      let fetchCalled = false;
      globalThis.fetch = mock(async () => {
        fetchCalled = true;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const result = await client.request('GET', '/test');
      expect(result).toEqual(responseData);
      expect(fetchCalled).toBe(true);
    }) as any;

    test('should construct URL correctly with leading slash', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test-path');
      expect(calledUrl).toBe('https://api.caret.so/v1/test-path');
    }) as any;

    test('should construct URL correctly without leading slash', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', 'test-path');
      expect(calledUrl).toBe('https://api.caret.so/v1/test-path');
    }) as any;

    test('should add query parameters', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test', {
        params: { limit: 10, offset: 20, search: 'hello world' }
      }) as any;
      
      expect(calledUrl).toBe('https://api.caret.so/v1/test?limit=10&offset=20&search=hello+world');
    }) as any;

    test('should skip undefined and null parameters', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test', {
        params: { limit: 10, offset: undefined, search: null, sort: 'name' }
      }) as any;
      
      expect(calledUrl).toBe('https://api.caret.so/v1/test?limit=10&sort=name');
    }) as any;

    test('should set correct headers', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test', {
        headers: { 'Custom-Header': 'custom-value' }
      }) as any;
      
      expect(calledOptions.headers).toEqual({
        'Authorization': 'Bearer sk-test-key',
        'Content-Type': 'application/json',
        'Custom-Header': 'custom-value'
      }) as any;
    }) as any;

    test('should include body for POST requests', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse();
      }) as any;
      
      const body = { name: 'test', value: 123 };
      await client.request('POST', '/test', { body }) as any;
      
      expect(calledOptions.method).toBe('POST');
      expect(calledOptions.body).toBe(JSON.stringify(body));
    }) as any;

    test('should not include body for GET requests', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test', { body: { ignored: true } }) as any;
      
      expect(calledOptions.method).toBe('GET');
      expect(calledOptions.body).toBeUndefined();
    }) as any;

    test('should set timeout signal', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse();
      }) as any;
      
      await client.request('GET', '/test');
      expect(calledOptions.signal).toBeDefined();
    }) as any;
  }) as any;

  describe('Error Handling', () => {
    let client: Caret;

    beforeEach(() => {
      client = new Caret({ apiKey: 'sk-test-key' }) as any;
    }) as any;

    test('should throw CaretAPIError for 400 status', async () => {
      const errorData = { message: 'Bad request' };
      globalThis.fetch = mock(async () => createMockErrorResponse(400, errorData));

      await expect(client.request('GET', '/test')).rejects.toThrow('Bad request');
    }) as any;

    test('should throw CaretAPIError for 404 status', async () => {
      const errorData = { message: 'Not found' };
      globalThis.fetch = mock(async () => createMockErrorResponse(404, errorData));

      await expect(client.request('GET', '/test')).rejects.toThrow('Not found');
    }) as any;

    test('should handle malformed error response JSON', async () => {
      globalThis.fetch = mock(async () => new Response('invalid json', {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));

      await expect(client.request('GET', '/test')).rejects.toThrow();
    }) as any;

    test('should include request headers in error', async () => {
      const errorData = { message: 'Unauthorized' };
      const headers = { 'X-Request-ID': 'req-123' };
      globalThis.fetch = mock(async () => createMockErrorResponse(401, errorData, headers));

      try {
        await client.request('GET', '/test');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as CaretAPIError).requestId).toBe('req-123');
      }
    }) as any;
  }) as any;

  describe('Retry Logic', () => {
    let client: Caret;

    beforeEach(() => {
      client = new Caret({ apiKey: 'sk-test-key', maxRetries: 2 }) as any;
    }) as any;

    test('should retry on rate limit error', async () => {
      const successResponse = createMockResponse({ data: { success: true } }) as any;
      let callCount = 0;
      
      globalThis.fetch = mock(async () => {
        callCount++;
        if (callCount <= 2) {
          return createMockErrorResponse(429, { message: 'Rate limited' }) as any;
        }
        return successResponse;
      }) as any;

      const result = await client.request('GET', '/test');
      expect(result).toEqual({ success: true }) as any;
      expect(callCount).toBe(3);
    }) as any;

    test('should retry on network errors', async () => {
      const successResponse = createMockResponse({ data: { success: true } }) as any;
      let callCount = 0;
      
      globalThis.fetch = mock(async () => {
        callCount++;
        if (callCount <= 1) {
          throw new Error('Network error');
        }
        return successResponse;
      }) as any;

      const result = await client.request('GET', '/test');
      expect(result).toEqual({ success: true }) as any;
      expect(callCount).toBe(2);
    }) as any;

    test('should stop retrying after maxRetries attempts', async () => {
      let callCount = 0;
      globalThis.fetch = mock(async () => {
        callCount++;
        throw new Error('Persistent network error');
      }) as any;

      await expect(client.request('GET', '/test')).rejects.toThrow('Persistent network error');
      expect(callCount).toBe(3); // initial + 2 retries
    }) as any;

    test('should not retry on non-retriable errors', async () => {
      let callCount = 0;
      globalThis.fetch = mock(async () => {
        callCount++;
        return createMockErrorResponse(400, { message: 'Bad request' }) as any;
      }) as any;

      await expect(client.request('GET', '/test')).rejects.toThrow('Bad request');
      expect(callCount).toBe(1);
    }) as any;
  }) as any;

  describe('HTTP Method Shortcuts', () => {
    let client: Caret;

    beforeEach(() => {
      client = new Caret({ apiKey: 'sk-test-key' }) as any;
    }) as any;

    test('get() should call request with GET method', async () => {
      let calledUrl = '';
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledUrl = url;
        calledOptions = options;
        return createMockResponse({ data: { success: true } }) as any;
      }) as any;
      
      await client.get('/test', { params: { id: '123' } }) as any;
      
      expect(calledUrl).toBe('https://api.caret.so/v1/test?id=123');
      expect(calledOptions.method).toBe('GET');
    }) as any;

    test('post() should call request with POST method', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: { success: true } }) as any;
      }) as any;
      
      const body = { name: 'test' };
      await client.post('/test', { body }) as any;
      
      expect(calledOptions.method).toBe('POST');
      expect(calledOptions.body).toBe(JSON.stringify(body));
    }) as any;

    test('patch() should call request with PATCH method', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: { success: true } }) as any;
      }) as any;
      
      const body = { name: 'updated' };
      await client.patch('/test', { body }) as any;
      
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(body));
    }) as any;

    test('put() should call request with PUT method', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: { success: true } }) as any;
      }) as any;
      
      const body = { name: 'replaced' };
      await client.put('/test', { body }) as any;
      
      expect(calledOptions.method).toBe('PUT');
      expect(calledOptions.body).toBe(JSON.stringify(body));
    }) as any;

    test('delete() should call request with DELETE method', async () => {
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: { success: true } }) as any;
      }) as any;
      
      await client.delete('/test');
      
      expect(calledOptions.method).toBe('DELETE');
    }) as any;
  }) as any;
}) as any;
