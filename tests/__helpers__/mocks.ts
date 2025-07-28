import { mock } from "bun:test";
import type { APIErrorData, ResponseBody } from "../../src/types/common.js";
import type { MockFetch } from "../../src/types/test.js";

export interface MockResponseOptions {
	status?: number;
	statusText?: string;
	headers?: Record<string, string>;
	data?: ResponseBody;
}

export function createMockResponse(options: MockResponseOptions = {}) {
	const {
		status = 200,
		statusText = "OK",
		headers = { "Content-Type": "application/json" },
		data = {},
	} = options;

	// Using any cast here for test compatibility with Bun's Response implementation
	const response = new Response(JSON.stringify(data), {
		status,
		statusText,
		headers,
	}) as Response;

	return response;
}

export function createMockErrorResponse(
	status: number,
	error: APIErrorData = {},
	headers: Record<string, string> = {},
) {
	// Using any cast here for test compatibility with Bun's Response implementation
	return new Response(JSON.stringify(error), {
		status,
		statusText: getStatusText(status),
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
	}) as Response;
}

export function createNetworkErrorResponse() {
	return Promise.reject(new Error("Network error"));
}

export function createTimeoutResponse() {
	return Promise.reject(new Error("TimeoutError"));
}

export function createMalformedJsonResponse() {
	// Using any cast here for test compatibility with Bun's Response implementation
	return new Response("invalid json", {
		status: 200,
		headers: { "Content-Type": "application/json" },
	}) as Response;
}

function getStatusText(status: number): string {
	const statusTexts: Record<number, string> = {
		200: "OK",
		400: "Bad Request",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not Found",
		409: "Conflict",
		422: "Unprocessable Entity",
		429: "Too Many Requests",
		500: "Internal Server Error",
	};
	return statusTexts[status] || "Unknown";
}

export function mockFetch(
	response: Response | Promise<Response> | (() => Response | Promise<Response>),
): MockFetch {
	if (typeof response === "function") {
		return mock(response) as MockFetch;
	}
	return mock(() => response) as MockFetch;
}

export function mockFetchWithDelay(
	response: Response,
	delay: number = 100,
): MockFetch {
	return mock(
		() => new Promise((resolve) => setTimeout(() => resolve(response), delay)),
	) as MockFetch;
}

export const sampleNote = {
	id: "note_123",
	title: "Test Meeting Notes",
	kind: "online" as const,
	status: "completed" as const,
	createdAt: "2024-01-01T10:00:00Z",
	updatedAt: "2024-01-01T11:00:00Z",
	visibility: "workspace" as const,
	tags: [{ id: "tag_1", name: "Important", color: "#ff0000" }],
	participants: [
		{
			name: "John Doe",
			email: "john@example.com",
			profileImageUrl: "https://example.com/john.jpg",
			accountName: "Example Corp",
			accountDomain: "example.com",
			accountImageUrl: "https://example.com/logo.jpg",
		},
	],
	totalDurationSec: 3600,
	userWrittenNote: "User notes here",
	enhancedNote: "Enhanced notes here",
	summary: "Meeting summary",
	transcripts: [
		{
			speaker: "John Doe",
			text: "Hello everyone",
			startTimestamp: "00:00:00",
			endTimestamp: "00:00:03",
		},
	],
};

export const sampleNotesListResponse = {
	items: [sampleNote],
	pagination: {
		limit: 10,
		nextOffset: 10,
		isLast: false,
	},
};
