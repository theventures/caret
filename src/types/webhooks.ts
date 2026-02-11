import type { Meeting } from "./meeting.js";

export interface WebhookEvent<T = unknown> {
	type: string;
	eventId: string;
	webhookId: string;
	workspaceId: string;
	timestamp: string;
	payload: T;
}

export interface MeetingCreatedPayload {
	meeting: Meeting;
}

export interface MeetingAudioUploadedPayload {
	audio_url: string;
}

export interface TestPayload {
	message: string;
}

export type WebhookEventMap = {
	"meeting.created": WebhookEvent<MeetingCreatedPayload>;
	"meeting.audio_uploaded": WebhookEvent<MeetingAudioUploadedPayload>;
	test: WebhookEvent<TestPayload>;
};

export type WebhookEventType = keyof WebhookEventMap;
