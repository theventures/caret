import type { Note } from "./note.js";

export interface WebhookEvent<T = unknown> {
	type: string;
	eventId: string;
	webhookId: string;
	workspaceId: string;
	timestamp: string;
	payload: T;
}

export interface NoteCreatedPayload {
	note: Note;
}

export interface NoteAudioUploadedPayload {
	noteId: string;
	audioUrl: string;
}

export interface TestPayload {
	message: string;
}

export type WebhookEventMap = {
	"note.created": WebhookEvent<NoteCreatedPayload>;
	"note.audio_uploaded": WebhookEvent<NoteAudioUploadedPayload>;
	test: WebhookEvent<TestPayload>;
};

export type WebhookEventType = keyof WebhookEventMap;
