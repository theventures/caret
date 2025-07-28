import { APIResource } from "../core/resource.js";
import type {
	Note,
	NoteResponse,
	NotesListParams,
	NotesListResponse,
	NoteUpdateParams,
} from "../types/note.js";

export class Notes extends APIResource {
	/**
	 * Retrieve a list of notes from the workspace
	 */
	async list(params: NotesListParams = {}): Promise<NotesListResponse> {
		return this._client.get("/notes", {
			params: params as Record<string, unknown>,
		}) as unknown as Promise<NotesListResponse>;
	}

	/**
	 * Get a specific note by ID
	 */
	async get(id: string): Promise<Note> {
		const response = (await this._client.get(
			`/notes/${id}`,
		)) as unknown as NoteResponse;
		return response.note;
	}

	/**
	 * Update a specific note
	 */
	async update(id: string, params: NoteUpdateParams): Promise<Note> {
		const response = (await this._client.patch(`/notes/${id}`, {
			body: params,
		})) as unknown as NoteResponse;
		return response.note;
	}
}
