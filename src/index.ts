export { Caret } from './client.js';
export type { CaretOptions } from './client.js';
export { Notes } from './resources/notes.js';
export type {
  Note,
  NoteTag,
  NoteParticipant,
  NoteTranscript,
  NoteKind,
  NoteStatus,
  NoteVisibility,
  NotesListParams,
  NotesListResponse,
  NoteUpdateParams,
  NoteResponse,
} from './types/note.js';
export {
  CaretError,
  CaretAPIError,
  BadRequestError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
} from './core/errors.js';