import { CaretAPIError } from "./core/errors.js";
import { Notes } from "./resources/notes.js";
import type { APIErrorData, ResponseBody } from "./types/common.js";

export interface CaretOptions {
	apiKey?: string;
	baseURL?: string;
	timeout?: number;
	maxRetries?: number;
}

export class Caret {
	readonly apiKey: string;
	readonly baseURL: string;
	readonly timeout: number;
	readonly maxRetries: number;

	notes: Notes;

	constructor(options: CaretOptions = {}) {
		this.apiKey = options.apiKey ?? process.env.CARET_API_KEY ?? "";
		this.baseURL = options.baseURL ?? "https://api.caret.so/v1";
		this.timeout = options.timeout ?? 30000;
		this.maxRetries = options.maxRetries ?? 3;

		if (!this.apiKey) {
			throw new Error(
				"API key is required. Set CARET_API_KEY environment variable or pass apiKey option.",
			);
		}

		this.notes = new Notes(this);
	}

	async request(
		method: string,
		path: string,
		options: {
			params?: Record<string, unknown>;
			body?: unknown;
			headers?: Record<string, string>;
		} = {},
	): Promise<ResponseBody> {
		const cleanPath = path.startsWith("/") ? path.slice(1) : path;
		const url = new URL(
			cleanPath,
			this.baseURL.endsWith("/") ? this.baseURL : `${this.baseURL}/`,
		);

		if (options.params) {
			Object.entries(options.params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
			...options.headers,
		};

		const requestOptions: RequestInit = {
			method,
			headers,
			signal: AbortSignal.timeout(this.timeout),
		};

		if (
			options.body &&
			(method === "POST" || method === "PATCH" || method === "PUT")
		) {
			requestOptions.body = JSON.stringify(options.body);
		}

		let lastError: Error;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				const response = await fetch(url.toString(), requestOptions);

				const responseHeaders: Record<string, string> = {};
				response.headers.forEach((value, key) => {
					responseHeaders[key] = value;
				});

				if (!response.ok) {
					let errorData: APIErrorData;
					try {
						errorData = (await response.json()) as APIErrorData;
					} catch {
						errorData = { message: response.statusText };
					}

					throw CaretAPIError.generate(
						response.status,
						errorData,
						errorData.message ||
							`HTTP ${response.status}: ${response.statusText}`,
						responseHeaders,
					);
				}

				return await response.json();
			} catch (error) {
				lastError = error as Error;

				if (error instanceof CaretAPIError) {
					if (error.status === 429 && attempt < this.maxRetries) {
						const retryAfter =
							error.headers["retry-after"] || error.headers["Retry-After"];
						const delay = retryAfter
							? parseInt(retryAfter) * 1000
							: 2 ** attempt * 1000;
						await new Promise((resolve) => setTimeout(resolve, delay));
						continue;
					}
					throw error;
				}

				if (attempt < this.maxRetries) {
					const delay = 2 ** attempt * 1000;
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		}

		throw lastError;
	}

	get(
		path: string,
		options?: {
			params?: Record<string, unknown>;
			headers?: Record<string, string>;
		},
	) {
		return this.request("GET", path, options);
	}

	post(
		path: string,
		options?: { body?: unknown; headers?: Record<string, string> },
	) {
		return this.request("POST", path, options);
	}

	patch(
		path: string,
		options?: { body?: unknown; headers?: Record<string, string> },
	) {
		return this.request("PATCH", path, options);
	}

	put(
		path: string,
		options?: { body?: unknown; headers?: Record<string, string> },
	) {
		return this.request("PUT", path, options);
	}

	delete(path: string, options?: { headers?: Record<string, string> }) {
		return this.request("DELETE", path, options);
	}
}
