import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Caret } from "../../src/client.js";
import { Notes } from "../../src/resources/notes.js";
import type {
	NotesListParams,
	NoteUpdateParams,
} from "../../src/types/note.js";
import {
	castMockToFetch,
	createMockErrorResponse,
	createMockResponse,
	sampleNote,
	sampleNotesListResponse,
} from "../__helpers__/mocks.js";

describe("Notes Resource", () => {
	let originalFetch: typeof globalThis.fetch;
	let client: Caret;
	let notes: Notes;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		client = new Caret({ apiKey: "sk-test-key" });
		notes = client.notes;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe("list()", () => {
		test("should list notes with default parameters", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: sampleNotesListResponse })),
			);

			const result = await notes.list();

			expect(result).toEqual(sampleNotesListResponse);
		});

		test("should list notes with query parameters", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: sampleNotesListResponse });
				}),
			);

			const params: NotesListParams = {
				limit: 20,
				offset: 10,
				sortBy: "createdAt",
				sortOrder: "desc",
				status: "completed",
				kind: "online",
				search: "meeting notes",
				createdBy: "user_123",
				fromDate: "2024-01-01T00:00:00Z",
				toDate: "2024-01-31T23:59:59Z",
				tagIds: "tag_1,tag_2",
				participantEmail: "john@example.com",
			};

			const result = await notes.list(params);

			expect(result).toEqual(sampleNotesListResponse);
			expect(calledUrl).toBe(
				"https://api.caret.so/v1/notes?limit=20&offset=10&sortBy=createdAt&sortOrder=desc&status=completed&kind=online&search=meeting+notes&createdBy=user_123&fromDate=2024-01-01T00%3A00%3A00Z&toDate=2024-01-31T23%3A59%3A59Z&tagIds=tag_1%2Ctag_2&participantEmail=john%40example.com",
			);
		});

		test("should list notes with partial parameters", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: sampleNotesListResponse });
				}),
			);

			const params: NotesListParams = {
				limit: 5,
				search: "important",
				status: "completed",
			};

			const result = await notes.list(params);

			expect(result).toEqual(sampleNotesListResponse);
			expect(calledUrl).toBe(
				"https://api.caret.so/v1/notes?limit=5&search=important&status=completed",
			);
		});

		test("should handle empty parameters", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: sampleNotesListResponse });
				}),
			);

			const result = await notes.list({});

			expect(result).toEqual(sampleNotesListResponse);
			expect(calledUrl).toBe("https://api.caret.so/v1/notes");
		});

		test("should handle API errors", async () => {
			const errorData = { message: "Unauthorized" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(401, errorData)),
			);

			await expect(notes.list()).rejects.toThrow("Unauthorized");
		});

		test("should handle empty response", async () => {
			const emptyResponse = {
				items: [],
				pagination: {
					limit: 10,
					nextOffset: 0,
					isLast: true,
				},
			};
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: emptyResponse })),
			);

			const result = await notes.list();

			expect(result).toEqual(emptyResponse);
			expect(result.items).toHaveLength(0);
		});
	});

	describe("get()", () => {
		test("should get note by ID", async () => {
			const responseData = { note: sampleNote };
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: responseData });
				}),
			);

			const result = await notes.get("note_123");

			expect(result).toEqual(sampleNote);
			expect(calledUrl).toBe("https://api.caret.so/v1/notes/note_123");
		});

		test("should handle special characters in note ID", async () => {
			const responseData = { note: sampleNote };
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: responseData });
				}),
			);

			const noteId = "note_with-special.chars_123";
			const result = await notes.get(noteId);

			expect(result).toEqual(sampleNote);
			expect(calledUrl).toBe(
				"https://api.caret.so/v1/notes/note_with-special.chars_123",
			);
		});

		test("should return null for non-existent note (404)", async () => {
			const errorData = { message: "Note not found" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(404, errorData)),
			);

			const result = await notes.get("non_existent_note");

			expect(result).toBe(null);
		});

		test("should still throw other errors (non-404)", async () => {
			const errorData = { message: "Unauthorized" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(401, errorData)),
			);

			await expect(notes.get("some_note")).rejects.toThrow("Unauthorized");
		});

		test("should handle empty note ID", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({ data: { note: sampleNote } });
				}),
			);

			await notes.get("");

			expect(calledUrl).toBe("https://api.caret.so/v1/notes/");
		});
	});

	describe("update()", () => {
		test("should update note with all parameters", async () => {
			const updatedNote = { ...sampleNote, title: "Updated Meeting Notes" };
			const responseData = { note: updatedNote };
			let calledUrl = "";
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit | undefined) => {
					calledUrl = url;
					calledOptions = options as RequestInit;
					return createMockResponse({ data: responseData });
				}),
			);

			const updateParams: NoteUpdateParams = {
				title: "Updated Meeting Notes",
				visibility: "private",
				userWrittenNote: "Updated user notes",
				tagIds: ["tag_1", "tag_2"],
			};

			const result = await notes.update("note_123", updateParams);

			expect(result).toEqual(updatedNote);
			expect(calledUrl).toBe("https://api.caret.so/v1/notes/note_123");
			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(updateParams));
		});

		test("should update note with partial parameters", async () => {
			const updatedNote = { ...sampleNote, title: "New Title" };
			const responseData = { note: updatedNote };
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: responseData });
				}),
			);

			const updateParams: NoteUpdateParams = {
				title: "New Title",
			};

			const result = await notes.update("note_123", updateParams);

			expect(result).toEqual(updatedNote);
			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(updateParams));
		});

		test("should update note visibility", async () => {
			const updatedNote = { ...sampleNote, visibility: "shared" as const };
			const responseData = { note: updatedNote };
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: responseData });
				}),
			);

			const updateParams: NoteUpdateParams = {
				visibility: "shared",
			};

			const result = await notes.update("note_123", updateParams);

			expect(result).toEqual(updatedNote);
			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(updateParams));
		});

		test("should update note tags", async () => {
			const updatedNote = { ...sampleNote };
			const responseData = { note: updatedNote };
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: responseData });
				}),
			);

			const updateParams: NoteUpdateParams = {
				tagIds: ["tag_new_1", "tag_new_2", "tag_new_3"],
			};

			const result = await notes.update("note_123", updateParams);

			expect(result).toEqual(updatedNote);
			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(updateParams));
		});

		test("should handle empty update parameters", async () => {
			const responseData = { note: sampleNote };
			let calledOptions: RequestInit = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit | undefined) => {
					calledOptions = options as RequestInit;
					return createMockResponse({ data: responseData });
				}),
			);

			const updateParams: NoteUpdateParams = {};

			const result = await notes.update("note_123", updateParams);

			expect(result).toEqual(sampleNote);
			expect(calledOptions.method).toBe("PATCH");
			expect(calledOptions.body).toBe(JSON.stringify(updateParams));
		});

		test("should handle 404 error for non-existent note", async () => {
			const errorData = { message: "Note not found" };
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(404, errorData)),
			);

			const updateParams: NoteUpdateParams = { title: "New Title" };

			await expect(
				notes.update("non_existent_note", updateParams),
			).rejects.toThrow("Note not found");
		});

		test("should handle validation errors", async () => {
			const errorData = {
				message: "Validation failed",
				errors: {
					title: "Title is required",
					visibility: "Invalid visibility value",
				},
			};
			globalThis.fetch = castMockToFetch(
				mock(async () => createMockErrorResponse(422, errorData)),
			);

			const updateParams: NoteUpdateParams = { title: "" };

			await expect(notes.update("note_123", updateParams)).rejects.toThrow(
				"Validation failed",
			);
		});
	});

	describe("Notes Resource Integration", () => {
		test("should be properly initialized by client", () => {
			expect(notes).toBeInstanceOf(Notes);
			expect((notes as unknown as { _client: Caret })._client).toBe(client);
		});

		test("should inherit from APIResource", async () => {
			const notesWithClient = notes as unknown as { _client: Caret };
			expect(notesWithClient._client).toBeDefined();
			expect(typeof notesWithClient._client.get).toBe("function");
			expect(typeof notesWithClient._client.patch).toBe("function");
		});
	});
});
