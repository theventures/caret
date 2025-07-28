import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Caret, type CaretOptions } from "../src/client.js";
import { AuthenticationError, type CaretAPIError } from "../src/core/errors.js";
import {
	castMockToFetch,
	createMockErrorResponse,
	createMockResponse,
} from "./__helpers__/mocks.js";

describe("Caret Client", () => {
	let originalFetch: typeof globalThis.fetch;
	let originalEnv: typeof process.env;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		originalEnv = process.env;
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = originalEnv;
	});

	describe("Constructor", () => {
		test("should create client with API key from options", () => {
			const client = new Caret({ apiKey: "sk-test-key" });
			expect(client.apiKey).toBe("sk-test-key");
		});

		test("should create client with API key from environment variable", () => {
			process.env.CARET_API_KEY = "sk-env-key";
			const client = new Caret();
			expect(client.apiKey).toBe("sk-env-key");
		});

		test("should prefer options API key over environment variable", () => {
			process.env.CARET_API_KEY = "sk-env-key";
			const client = new Caret({ apiKey: "sk-options-key" });
			expect(client.apiKey).toBe("sk-options-key");
		});

		test("should throw error when no API key provided", () => {
			delete process.env.CARET_API_KEY;
			expect(() => new Caret()).toThrow("API key is required");
		});

		test("should set default configuration values", () => {
			const client = new Caret({ apiKey: "sk-test-key" });
			expect(client.baseURL).toBe("https://api.caret.so/v1");
			expect(client.timeout).toBe(30000);
			expect(client.maxRetries).toBe(3);
		});

		test("should use custom configuration values", () => {
			const options: CaretOptions = {
				apiKey: "sk-test-key",
				baseURL: "https://custom.api.com/v2",
				timeout: 60000,
				maxRetries: 5,
			};
			const client = new Caret(options);
			expect(client.baseURL).toBe("https://custom.api.com/v2");
			expect(client.timeout).toBe(60000);
			expect(client.maxRetries).toBe(5);
		});

		test("should initialize notes resource", () => {
			const client = new Caret({ apiKey: "sk-test-key" });
			expect(client.notes).toBeDefined();
		});
	});

	describe("Request Method", () => {
		let client: Caret;

		beforeEach(() => {
			client = new Caret({ apiKey: "sk-test-key" });
		});

		test("should make successful GET request", async () => {
			const responseData = { message: "success" };
			let fetchCalled = false;
			globalThis.fetch = castMockToFetch(
				mock(async () => {
					fetchCalled = true;
					return createMockResponse({ data: responseData });
				}),
			);

			const result = await client.request("GET", "/test");
			expect(result).toEqual(responseData);
			expect(fetchCalled).toBe(true);
		});

		test("should construct URL correctly with leading slash", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test-path");
			expect(calledUrl).toBe("https://api.caret.so/v1/test-path");
		});

		test("should construct URL correctly without leading slash", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse();
				}),
			);

			await client.request("GET", "test-path");
			expect(calledUrl).toBe("https://api.caret.so/v1/test-path");
		});

		test("should add query parameters", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test", {
				params: { limit: 10, offset: 20, search: "hello world" },
			});

			expect(calledUrl).toBe(
				"https://api.caret.so/v1/test?limit=10&offset=20&search=hello+world",
			);
		});

		test("should skip undefined and null parameters", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test", {
				params: { limit: 10, offset: undefined, search: null, sort: "name" },
			});

			expect(calledUrl).toBe("https://api.caret.so/v1/test?limit=10&sort=name");
		});

		test("should set correct headers", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test", {
				headers: { "Custom-Header": "custom-value" },
			});

			expect(calledOptions.headers).toEqual({
				Authorization: "Bearer sk-test-key",
				"Content-Type": "application/json",
				"Custom-Header": "custom-value",
			});
		});

		test("should include body for POST requests", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse();
				}),
			);

			const body = { name: "test", value: 123 };
			await client.request("POST", "/test", { body });

			expect(calledOptions.method).toBe("POST");
			expect(calledOptions.body).toBe(JSON.stringify(body));
		});

		test("should not include body for GET requests", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test", {
				body: { ignored: true },
			});

			expect(calledOptions.method).toBe("GET");
			expect(calledOptions.body).toBeUndefined();
		});

		test("should set timeout signal", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse();
				}),
			);

			await client.request("GET", "/test");
			expect(calledOptions.signal).toBeDefined();
		});
	});

	describe("Error Handling", () => {
		let client: Caret;

		beforeEach(() => {
			client = new Caret({ apiKey: "sk-test-key" });
		});

		test("should throw CaretAPIError for 400 status", async () => {
			const errorData = { message: "Bad request" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(400, errorData)),
			);

			await expect(client.request("GET", "/test")).rejects.toThrow(
				"Bad request",
			);
		});

		test("should throw CaretAPIError for 404 status", async () => {
			const errorData = { message: "Not found" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(404, errorData)),
			);

			await expect(client.request("GET", "/test")).rejects.toThrow("Not found");
		});

		test("should handle malformed error response JSON", async () => {
			globalThis.fetch = castMockToFetch(
				mock(
					async () =>
						new Response("invalid json", {
							status: 500,
							headers: { "Content-Type": "application/json" },
						}),
				),
			);

			await expect(client.request("GET", "/test")).rejects.toThrow();
		});

		test("should include request headers in error", async () => {
			const errorData = { message: "Unauthorized" };
			const headers = { "X-Request-ID": "req-123" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(401, errorData, headers)),
			);

			try {
				await client.request("GET", "/test");
			} catch (error) {
				expect(error).toBeInstanceOf(AuthenticationError);
				expect((error as CaretAPIError).requestId).toBe("req-123");
			}
		});
	});

	describe("Retry Logic", () => {
		let client: Caret;

		beforeEach(() => {
			client = new Caret({ apiKey: "sk-test-key", maxRetries: 2 });
		});

		test("should retry on rate limit error", async () => {
			const successResponse = createMockResponse({
				data: { success: true },
			});
			let callCount = 0;

			globalThis.fetch = castMockToFetch(
				mock(async () => {
					callCount++;
					if (callCount <= 2) {
						return createMockErrorResponse(429, {
							message: "Rate limited",
						});
					}
					return successResponse;
				}),
			);

			const result = await client.request("GET", "/test");
			expect(result).toEqual({ success: true });
			expect(callCount).toBe(3);
		});

		test("should retry on network errors", async () => {
			const successResponse = createMockResponse({
				data: { success: true },
			});
			let callCount = 0;

			globalThis.fetch = castMockToFetch(
				mock(async () => {
					callCount++;
					if (callCount <= 1) {
						throw new Error("Network error");
					}
					return successResponse;
				}),
			);

			const result = await client.request("GET", "/test");
			expect(result).toEqual({ success: true });
			expect(callCount).toBe(2);
		});

		test("should stop retrying after maxRetries attempts", async () => {
			let callCount = 0;
			globalThis.fetch = castMockToFetch(
				mock(async () => {
					callCount++;
					throw new Error("Persistent network error");
				}),
			);

			await expect(client.request("GET", "/test")).rejects.toThrow(
				"Persistent network error",
			);
			expect(callCount).toBe(3); // initial + 2 retries
		});

		test("should not retry on non-retriable errors", async () => {
			let callCount = 0;
			globalThis.fetch = castMockToFetch(
				mock(async () => {
					callCount++;
					return createMockErrorResponse(400, { message: "Bad request" });
				}),
			);

			await expect(client.request("GET", "/test")).rejects.toThrow(
				"Bad request",
			);
			expect(callCount).toBe(1);
		});
	});

	describe("HTTP Method Shortcuts", () => {
		let client: Caret;

		beforeEach(() => {
			client = new Caret({ apiKey: "sk-test-key" });
		});

		test("get() should call request with GET method", async () => {
			let calledUrl = "";
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit | undefined) => {
					calledUrl = url;
					calledOptions = options as RequestInit;
					return createMockResponse({ data: { success: true } });
				}),
			);

			await client.get("/test", { params: { id: "123" } });

			expect(calledUrl).toBe("https://api.caret.so/v1/test?id=123");
			expect(calledOptions.method).toBe("GET");
		});

		test("post() should call request with POST method", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: { success: true } });
				}),
			);

			const body = { name: "test" };
			await client.post("/test", { body });

			expect(calledOptions.method).toBe("POST");
			expect(calledOptions.body).toBe(JSON.stringify(body));
		});

		test("patch() should call request with PATCH method", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: { success: true } });
				}),
			);

			const body = { name: "updated" };
			await client.patch("/test", { body });

			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(body));
		});

		test("put() should call request with PUT method", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: { success: true } });
				}),
			);

			const body = { name: "replaced" };
			await client.put("/test", { body });

			expect(calledOptions.method).toBe("PUT");
			expect(calledOptions.body).toBe(JSON.stringify(body));
		});

		test("delete() should call request with DELETE method", async () => {
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: { success: true } });
				}),
			);

			await client.delete("/test");

			expect(calledOptions.method).toBe("DELETE");
		});
	});
});
