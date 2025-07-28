import { describe, test, expect } from 'bun:test';
import { Caret } from '../../src/client.js';
import { APIResource } from '../../src/core/resource.js';

class TestResource extends APIResource {
  public getClient() {
    return this._client;
  }
}

describe('APIResource', () => {
  test('should store client reference in constructor', () => {
    const client = new Caret({ apiKey: 'sk-test-key' }) as any;
    const resource = new TestResource(client);
    
    expect(resource.getClient()).toBe(client);
  }) as any;

  test('should be abstract class that can be extended', () => {
    const client = new Caret({ apiKey: 'sk-test-key' }) as any;
    const resource = new TestResource(client);
    
    expect(resource).toBeInstanceOf(APIResource);
    expect(resource).toBeInstanceOf(TestResource);
  }) as any;

  test('should maintain client reference for method calls', () => {
    const client = new Caret({ apiKey: 'sk-test-key' }) as any;
    const resource = new TestResource(client);
    
    const storedClient = resource.getClient();
    expect(storedClient.apiKey).toBe('sk-test-key');
    expect(storedClient.baseURL).toBe('https://api.caret.so/v1');
    expect(typeof storedClient.get).toBe('function');
    expect(typeof storedClient.post).toBe('function');
    expect(typeof storedClient.patch).toBe('function');
    expect(typeof storedClient.put).toBe('function');
    expect(typeof storedClient.delete).toBe('function');
  }) as any;
}) as any;