import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Caret } from '../../src/client.js';
import { Notes } from '../../src/resources/notes.js';
import type { NotesListParams, NoteUpdateParams } from '../../src/types/note.js';
import { 
  createMockResponse, 
  createMockErrorResponse,
  sampleNote,
  sampleNotesListResponse 
} from '../__helpers__/mocks.js';

describe('Notes Resource', () => {
  let originalFetch: typeof globalThis.fetch;
  let client: Caret;
  let notes: Notes;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    client = new Caret({ apiKey: 'sk-test-key' }) as any;
    notes = client.notes;
  }) as any;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  }) as any;

  describe('list()', () => {
    test('should list notes with default parameters', async () => {
      globalThis.fetch = mock(async () => createMockResponse({ data: sampleNotesListResponse }));

      const result = await notes.list();

      expect(result).toEqual(sampleNotesListResponse);
    }) as any;

    test('should list notes with query parameters', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: sampleNotesListResponse }) as any;
      }) as any;

      const params: NotesListParams = {
        limit: 20,
        offset: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'completed',
        kind: 'online',
        search: 'meeting notes',
        createdBy: 'user_123',
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-01-31T23:59:59Z',
        tagIds: 'tag_1,tag_2',
        participantEmail: 'john@example.com'
      };

      const result = await notes.list(params);

      expect(result).toEqual(sampleNotesListResponse);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes?limit=20&offset=10&sortBy=createdAt&sortOrder=desc&status=completed&kind=online&search=meeting+notes&createdBy=user_123&fromDate=2024-01-01T00%3A00%3A00Z&toDate=2024-01-31T23%3A59%3A59Z&tagIds=tag_1%2Ctag_2&participantEmail=john%40example.com');
    }) as any;

    test('should list notes with partial parameters', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: sampleNotesListResponse }) as any;
      }) as any;

      const params: NotesListParams = {
        limit: 5,
        search: 'important',
        status: 'completed'
      };

      const result = await notes.list(params);

      expect(result).toEqual(sampleNotesListResponse);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes?limit=5&search=important&status=completed');
    }) as any;

    test('should handle empty parameters', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: sampleNotesListResponse }) as any;
      }) as any;

      const result = await notes.list({}) as any;

      expect(result).toEqual(sampleNotesListResponse);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes');
    }) as any;

    test('should handle API errors', async () => {
      const errorData = { message: 'Unauthorized' };
      globalThis.fetch = mock(async () => createMockErrorResponse(401, errorData));

      await expect(notes.list()).rejects.toThrow('Unauthorized');
    }) as any;

    test('should handle empty response', async () => {
      const emptyResponse = {
        items: [],
        pagination: {
          limit: 10,
          nextOffset: 0,
          isLast: true
        }
      };
      globalThis.fetch = mock(async () => createMockResponse({ data: emptyResponse }));

      const result = await notes.list();

      expect(result).toEqual(emptyResponse);
      expect(result.items).toHaveLength(0);
    }) as any;
  }) as any;

  describe('get()', () => {
    test('should get note by ID', async () => {
      const responseData = { note: sampleNote };
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const result = await notes.get('note_123');

      expect(result).toEqual(sampleNote);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes/note_123');
    }) as any;

    test('should handle special characters in note ID', async () => {
      const responseData = { note: sampleNote };
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const noteId = 'note_with-special.chars_123';
      const result = await notes.get(noteId);

      expect(result).toEqual(sampleNote);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes/note_with-special.chars_123');
    }) as any;

    test('should handle 404 error for non-existent note', async () => {
      const errorData = { message: 'Note not found' };
      globalThis.fetch = mock(async () => createMockErrorResponse(404, errorData));

      await expect(notes.get('non_existent_note')).rejects.toThrow('Note not found');
    }) as any;

    test('should handle empty note ID', async () => {
      let calledUrl = '';
      globalThis.fetch = mock(async (url: string) => {
        calledUrl = url;
        return createMockResponse({ data: { note: sampleNote } }) as any;
      }) as any;

      await notes.get('');

      expect(calledUrl).toBe('https://api.caret.so/v1/notes/');
    }) as any;
  }) as any;

  describe('update()', () => {
    test('should update note with all parameters', async () => {
      const updatedNote = { ...sampleNote, title: 'Updated Meeting Notes' };
      const responseData = { note: updatedNote };
      let calledUrl = '';
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledUrl = url;
        calledOptions = options;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const updateParams: NoteUpdateParams = {
        title: 'Updated Meeting Notes',
        visibility: 'private',
        userWrittenNote: 'Updated user notes',
        tagIds: ['tag_1', 'tag_2']
      };

      const result = await notes.update('note_123', updateParams);

      expect(result).toEqual(updatedNote);
      expect(calledUrl).toBe('https://api.caret.so/v1/notes/note_123');
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(updateParams));
    }) as any;

    test('should update note with partial parameters', async () => {
      const updatedNote = { ...sampleNote, title: 'New Title' };
      const responseData = { note: updatedNote };
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const updateParams: NoteUpdateParams = {
        title: 'New Title'
      };

      const result = await notes.update('note_123', updateParams);

      expect(result).toEqual(updatedNote);
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(updateParams));
    }) as any;

    test('should update note visibility', async () => {
      const updatedNote = { ...sampleNote, visibility: 'shared' as const };
      const responseData = { note: updatedNote };
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const updateParams: NoteUpdateParams = {
        visibility: 'shared'
      };

      const result = await notes.update('note_123', updateParams);

      expect(result).toEqual(updatedNote);
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(updateParams));
    }) as any;

    test('should update note tags', async () => {
      const updatedNote = { ...sampleNote };
      const responseData = { note: updatedNote };
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const updateParams: NoteUpdateParams = {
        tagIds: ['tag_new_1', 'tag_new_2', 'tag_new_3']
      };

      const result = await notes.update('note_123', updateParams);

      expect(result).toEqual(updatedNote);
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(updateParams));
    }) as any;

    test('should handle empty update parameters', async () => {
      const responseData = { note: sampleNote };
      let calledOptions: any;
      globalThis.fetch = mock(async (url: string, options: any) => {
        calledOptions = options;
        return createMockResponse({ data: responseData }) as any;
      }) as any;

      const updateParams: NoteUpdateParams = {};

      const result = await notes.update('note_123', updateParams);

      expect(result).toEqual(sampleNote);
      expect(calledOptions.method).toBe('PATCH');
      expect(calledOptions.body).toBe(JSON.stringify(updateParams));
    }) as any;

    test('should handle 404 error for non-existent note', async () => {
      const errorData = { message: 'Note not found' };
      globalThis.fetch = mock(async () => createMockErrorResponse(404, errorData));

      const updateParams: NoteUpdateParams = { title: 'New Title' };

      await expect(notes.update('non_existent_note', updateParams)).rejects.toThrow('Note not found');
    }) as any;

    test('should handle validation errors', async () => {
      const errorData = { 
        message: 'Validation failed',
        errors: {
          title: 'Title is required',
          visibility: 'Invalid visibility value'
        }
      };
      globalThis.fetch = mock(async () => createMockErrorResponse(422, errorData));

      const updateParams: NoteUpdateParams = { title: '' };

      await expect(notes.update('note_123', updateParams)).rejects.toThrow('Validation failed');
    }) as any;
  }) as any;

  describe('Notes Resource Integration', () => {
    test('should be properly initialized by client', () => {
      expect(notes).toBeInstanceOf(Notes);
      expect(notes['_client']).toBe(client);
    }) as any;

    test('should inherit from APIResource', async () => {
      expect(notes['_client']).toBeDefined();
      expect(typeof notes['_client'].get).toBe('function');
      expect(typeof notes['_client'].patch).toBe('function');
    }) as any;
  }) as any;
}) as any;
