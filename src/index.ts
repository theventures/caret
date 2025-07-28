export type { CaretOptions } from "./client.js";
export { Caret } from "./client.js";
export {
	AuthenticationError,
	BadRequestError,
	CaretAPIError,
	CaretError,
	ConflictError,
	InternalServerError,
	NotFoundError,
	PermissionDeniedError,
	RateLimitError,
	UnprocessableEntityError,
} from "./core/errors.js";
export { Notes } from "./resources/notes.js";
export type {
	Note,
	NoteKind,
	NoteParticipant,
	NoteResponse,
	NoteStatus,
	NotesListParams,
	NotesListResponse,
	NoteTag,
	NoteTranscript,
	NoteUpdateParams,
	NoteVisibility,
} from "./types/note.js";
