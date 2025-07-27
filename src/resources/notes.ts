import { APIResource } from '../core/resource.js';
import type {
  Note,
  NotesListParams,
  NotesListResponse,
  NoteUpdateParams,
  NoteResponse,
} from '../types/note.js';

export class Notes extends APIResource {
  /**
   * Retrieve a list of notes from the workspace
   */
  async list(params: NotesListParams = {}): Promise<NotesListResponse> {
    return this._client.get('/notes', { params });
  }

  /**
   * Get a specific note by ID
   */
  async get(id: string): Promise<Note> {
    const response: NoteResponse = await this._client.get(`/notes/${id}`);
    return response.note;
  }

  /**
   * Update a specific note
   */
  async update(id: string, params: NoteUpdateParams): Promise<Note> {
    const response: NoteResponse = await this._client.patch(`/notes/${id}`, { body: params });
    return response.note;
  }
}