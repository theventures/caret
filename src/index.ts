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
export { Tags } from "./resources/tags.js";
export { Workspace } from "./resources/workspace.js";
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
export type {
	Tag,
	TagCreateParams,
	TagResponse,
	TagsListResponse,
} from "./types/tags.js";
export type {
	Group,
	Member,
	MemberResponse,
	MembersListParams,
	MembersListResponse,
	MemberUpdateParams,
	Pagination,
	Workspace as WorkspaceType,
	WorkspaceResponse,
	WorkspaceSettings,
} from "./types/workspace.js";
