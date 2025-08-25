import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Caret } from "../../src/client.js";
import { BadRequestError } from "../../src/core/errors.js";
import { Tags } from "../../src/resources/tags.js";
import type { Tag, TagCreateParams } from "../../src/types/tags.js";
import {
	castMockToFetch,
	createMockErrorResponse,
	createMockResponse,
} from "../__helpers__/mocks.js";

const sampleTag: Tag = {
	id: "01887270-89ab-7da0-c95d-9a9e9ebc9h23",
	name: "Sales",
	color: "#FF5733",
	createdAt: "2023-02-15T10:30:00Z",
};

const sampleTagsListResponse = {
	tags: [
		sampleTag,
		{
			id: "01887270-45ab-7da0-c95d-9a9e9ebc2k89",
			name: "Marketing",
			color: "#9933FF",
			createdAt: "2023-08-22T15:30:00Z",
		},
		{
			id: "01887270-67cd-7da0-c95d-9a9e9ebc3m12",
			name: "Engineering",
			color: "#00FF00",
			createdAt: "2023-09-10T09:15:00Z",
		},
	],
};

describe("Tags Resource", () => {
	let originalFetch: typeof globalThis.fetch;
	let client: Caret;
	let tags: Tags;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		client = new Caret({ apiKey: "sk-test-key" });
		tags = client.tags;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe("list()", () => {
		test("should list all tags in the workspace", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: sampleTagsListResponse })),
			);

			const result = await tags.list();

			expect(result).toEqual(sampleTagsListResponse.tags);
		});

		test("should handle empty tags list", async () => {
			const emptyResponse = { tags: [] };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: emptyResponse })),
			);

			const result = await tags.list();

			expect(result).toEqual([]);
		});

		test("should call correct endpoint", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({ data: sampleTagsListResponse });
				}),
			);

			await tags.list();

			expect(calledUrl).toBe("https://api.caret.so/v1/workspace/tags");
			expect(calledMethod).toBe("GET");
		});

		test("should include authorization header", async () => {
			let authHeader = "";
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					authHeader =
						(options.headers as Record<string, string>)?.Authorization || "";
					return createMockResponse({ data: sampleTagsListResponse });
				}),
			);

			await tags.list();

			expect(authHeader).toBe("Bearer sk-test-key");
		});

		test("should handle 401 authentication error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(401, { message: "Invalid API key" }),
				),
			);

			await expect(tags.list()).rejects.toThrow("Invalid API key");
		});

		test("should handle 500 server error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(500, { message: "Internal server error" }),
				),
			);

			await expect(tags.list()).rejects.toThrow("Internal server error");
		});
	});

	describe("create()", () => {
		const createParams: TagCreateParams = {
			name: "New Tag",
			color: "#123456",
		};

		const createdTagResponse = {
			tag: {
				id: "01887270-new-tag-id",
				name: "New Tag",
				color: "#123456",
				createdAt: "2024-01-15T10:30:00Z",
			},
		};

		test("should create a new tag", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: createdTagResponse })),
			);

			const result = await tags.create(createParams);

			expect(result).toEqual(createdTagResponse.tag);
		});

		test("should send correct request body", async () => {
			let requestBody = "";
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					requestBody = options.body as string;
					return createMockResponse({ data: createdTagResponse });
				}),
			);

			await tags.create(createParams);

			expect(JSON.parse(requestBody)).toEqual(createParams);
		});

		test("should call correct endpoint with POST method", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({ data: createdTagResponse });
				}),
			);

			await tags.create(createParams);

			expect(calledUrl).toBe("https://api.caret.so/v1/workspace/tags");
			expect(calledMethod).toBe("POST");
		});

		test("should include correct headers", async () => {
			let headers: Record<string, string> = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					headers = options.headers as Record<string, string>;
					return createMockResponse({ data: createdTagResponse });
				}),
			);

			await tags.create(createParams);

			expect(headers.Authorization).toBe("Bearer sk-test-key");
			expect(headers["Content-Type"]).toBe("application/json");
		});

		test("should handle validation errors", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(400, {
						message: "Validation failed",
						errors: {
							color: "Invalid color format",
						},
					}),
				),
			);

			await expect(tags.create(createParams)).rejects.toThrow(BadRequestError);
		});

		test("should handle duplicate tag name error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(409, {
						message: "A tag with this name already exists",
					}),
				),
			);

			await expect(tags.create(createParams)).rejects.toThrow(
				"A tag with this name already exists",
			);
		});

		test("should handle missing required fields", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(422, {
						message: "Unprocessable Entity",
						errors: {
							name: "Name is required",
							color: "Color is required",
						},
					}),
				),
			);

			await expect(tags.create({ name: "", color: "" })).rejects.toThrow(
				"Unprocessable Entity",
			);
		});

		test("should create tag with emoji in name", async () => {
			const emojiParams: TagCreateParams = {
				name: "🚀 Launch",
				color: "#FF00FF",
			};

			const emojiResponse = {
				tag: {
					id: "01887270-emoji-tag",
					name: "🚀 Launch",
					color: "#FF00FF",
					createdAt: "2024-01-15T10:30:00Z",
				},
			};

			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: emojiResponse })),
			);

			const result = await tags.create(emojiParams);

			expect(result).toEqual(emojiResponse.tag);
		});

		test("should handle rate limit error", async () => {
			// Use a client with no retries to avoid timeout in tests
			const noRetryClient = new Caret({ apiKey: "sk-test-key", maxRetries: 0 });
			const noRetryTags = noRetryClient.tags;

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(
						429,
						{ message: "Rate limit exceeded" },
						{ "Retry-After": "60" },
					),
				),
			);

			await expect(noRetryTags.create(createParams)).rejects.toThrow(
				"Rate limit exceeded",
			);
		});
	});

	describe("integration with Caret client", () => {
		test("should access tags through client instance", () => {
			expect(client.tags).toBeInstanceOf(Tags);
			expect(client.tags).toBe(tags);
		});

		test("should share client configuration", () => {
			const customClient = new Caret({
				apiKey: "custom-key",
				baseURL: "https://custom.api.caret.so/v1",
			});

			expect(customClient.tags).toBeInstanceOf(Tags);
		});
	});
});
