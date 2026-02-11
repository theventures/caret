export interface MeetingTranscriptWord {
	end: number;
	text: string;
	start: number;
}

export interface MeetingTranscript {
	id: string;
	end: number;
	text: string;
	start: number;
	words: MeetingTranscriptWord[];
	speaker: string;
	chunkId: string;
	segmentId: string;
}

export interface MeetingSpeakerAnalysis {
	id: string;
	name: string;
	role: string;
	nameReason: string;
	voiceSampleUrl: string;
	voiceCharacteristics: string;
}

export interface MeetingSummary {
	content: string;
	language: string;
	created_at: string;
	template_id: string | null;
}

export interface MeetingCreator {
	id: string;
	name: string;
	email: string;
	locale: string;
	job_title: string;
	profile_url: string;
}

export interface MeetingAclRule {
	id: string;
	user: string | null;
	folder: string | null;
	can_read: boolean;
	can_write: boolean;
	principal_type: string;
}

export interface MeetingCalendarEventAttendee {
	self: boolean;
	email: string;
	displayName: string;
}

export interface MeetingCalendarEvent {
	id: string;
	href: string;
	title: string;
	endsAt: string;
	startsAt: string;
	timezone: string;
	createdAt: string;
	updatedAt: string;
	calendarId: string;
	uuid: string;
	attendees: MeetingCalendarEventAttendee[];
}

export interface Meeting {
	id: string;
	workspace_id: string;
	status: string;
	permission: string;
	title: string;
	private_note: string;
	total_duration_sec: number;
	meeting_autostarted_app: string | null;
	audio_location: string;
	audio_url: string;
	created_by: string;
	created_at: string;
	updated_at: string;
	archived_at: string | null;
	suggestions: Record<string, unknown>;
	calendar_event_id: string;
	transcripts: MeetingTranscript[];
	language: string;
	is_auto_ended: boolean;
	auto_end_reason: string | null;
	live_scenario_id: string;
	questions: Record<string, unknown>;
	speaker_analysis: MeetingSpeakerAnalysis[];
	linked_crm: string | null;
	reference_call_supermemory_id: string | null;
	llm_sharing_agreed_at: string | null;
	summary: MeetingSummary;
	calendarEvent: MeetingCalendarEvent;
	timelineSummary: string;
	creator: MeetingCreator;
	acl_rules: MeetingAclRule[];
}
