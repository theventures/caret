export interface WorkspaceSettings {
	defaultLanguage: string;
	brandColor: string;
	enableTranscriptSharing: boolean;
}

export interface Workspace {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	settings: WorkspaceSettings;
	allowedEmailDomains: string[];
	iconUrl: string | null;
}

export interface WorkspaceResponse {
	workspace: Workspace;
}

export interface Group {
	id: string;
	name: string;
}

export interface Member {
	id: string;
	userId: string;
	name: string;
	email: string;
	profileUrl: string | null;
	role: "admin" | "member";
	createdAt: string;
	groups: Group[];
}

export interface MemberResponse {
	member: Member;
}

export interface MembersListParams {
	limit?: number;
	offset?: number;
	search?: string;
}

export interface Pagination {
	limit: number;
	nextOffset: number;
	isLast: boolean;
}

export interface MembersListResponse {
	items: Member[];
	pagination: Pagination;
}

export interface MemberUpdateParams {
	groupIds?: string[];
}
