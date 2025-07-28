// Common type definitions for the Caret API client

// Generic API error data structure
export interface APIErrorData {
	message?: string;
	code?: string;
	details?: string;
	errors?: Record<string, string>;
	[key: string]: unknown;
}

// Generic response body type for APIs
export type ResponseBody =
	| Record<string, unknown>
	| unknown[]
	| string
	| number
	| boolean
	| null;
