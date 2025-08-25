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

// Full group type returned by listGroups - this is the complete definition
export interface Group {
	id: string;
	name: string;
	createdAt: string;
	memberCount: number;
	description?: string;
}

// Base group type used in Member responses (minimal info)
export type GroupReference = Pick<Group, "id" | "name">;

// Group type returned by createGroup (no memberCount yet)
export type CreatedGroup = Omit<Group, "memberCount">;

export interface Member {
	id: string;
	userId: string;
	name: string;
	email: string;
	profileUrl: string | null;
	role: "admin" | "member";
	createdAt: string;
	groups: GroupReference[];
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

export interface GroupsListResponse {
	userGroups: Group[];
}

export interface GroupCreateParams {
	name: string;
	description?: string;
}

export interface GroupCreateResponse {
	group: CreatedGroup;
}

export interface Invite {
	id: string;
	email: string;
	code: string;
	role: "admin" | "member";
	expiresAt: string;
	createdAt: string;
	isUrlInvite: boolean;
	groups: GroupReference[];
}

export interface InvitesListParams {
	limit?: number;
	offset?: number;
}

export interface InvitesListResponse {
	items: Invite[];
	pagination: Pagination;
}

export interface InviteCreateParams {
	email: string;
	role?: "admin" | "member";
	isUrlInvite?: boolean;
	groupIds?: string[];
}

export interface InviteResponse {
	invite: Invite;
}

export interface InviteDeleteResponse {
	success: boolean;
	message: string;
}
