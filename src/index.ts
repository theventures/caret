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
	Meeting,
	MeetingAclRule,
	MeetingCalendarEvent,
	MeetingCalendarEventAttendee,
	MeetingCreator,
	MeetingSpeakerAnalysis,
	MeetingSummary,
	MeetingTranscript,
	MeetingTranscriptWord,
} from "./types/meeting.js";
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
	MeetingAudioUploadedPayload,
	MeetingCreatedPayload,
	TestPayload,
	WebhookEvent,
	WebhookEventMap,
	WebhookEventType,
} from "./types/webhooks.js";
export type {
	CreatedGroup,
	Group,
	GroupCreateParams,
	GroupCreateResponse,
	GroupReference,
	GroupsListResponse,
	Invite,
	InviteCreateParams,
	InviteDeleteResponse,
	InviteResponse,
	InvitesListParams,
	InvitesListResponse,
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
export { type VerifyRequestResult, WebhookVerifier } from "./webhooks/index.js";
