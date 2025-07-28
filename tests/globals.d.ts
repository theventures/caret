import type { Mock } from "bun:test";

declare global {
	namespace globalThis {
		// Mock fetch type for Bun testing framework compatibility
		var fetch: Mock<
			(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
		>;
	}
}
