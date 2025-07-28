// Test-specific type definitions

import type { Mock } from "bun:test";

// Mock function that returns a fetch-compatible function
export type MockFetch = Mock<
	(input: string | URL, init?: RequestInit) => Promise<Response>
>;

// Type for Bun's mock function return type
export type BunMockReturn<T extends (...args: unknown[]) => unknown> = Mock<T>;

// Helper type for test function wrapping (Bun test compatibility)
export type TestFunction = () => void | Promise<void>;
export type TestWrapper = (() => void) & { readonly __brand: unique symbol };
