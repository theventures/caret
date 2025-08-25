import { APIResource } from "../core/resource.js";
import type {
	CreatedGroup,
	Group,
	GroupCreateParams,
	GroupCreateResponse,
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
	WorkspaceResponse,
	Workspace as WorkspaceType,
} from "../types/workspace.js";

export class Workspace extends APIResource {
	/**
	 * Get the workspace details
	 */
	async get(): Promise<WorkspaceType> {
		const response = (await this._client.get(
			"/workspace",
		)) as unknown as WorkspaceResponse;
		return response.workspace;
	}

	/**
	 * List all members in the workspace
	 */
	async listMembers(params?: MembersListParams): Promise<MembersListResponse> {
		return (await this._client.get("/workspace/members", {
			params: params as Record<string, unknown>,
		})) as unknown as MembersListResponse;
	}

	/**
	 * Get a specific member by ID
	 */
	async getMember(id: string): Promise<Member> {
		const response = (await this._client.get(
			`/workspace/members/${id}`,
		)) as unknown as MemberResponse;
		return response.member;
	}

	/**
	 * Update a member's group assignments
	 */
	async updateMember(id: string, params: MemberUpdateParams): Promise<Member> {
		const response = (await this._client.patch(`/workspace/members/${id}`, {
			body: params,
		})) as unknown as MemberResponse;
		return response.member;
	}

	/**
	 * List all groups in the workspace
	 */
	async listGroups(): Promise<Group[]> {
		const response = (await this._client.get(
			"/workspace/groups",
		)) as unknown as GroupsListResponse;
		return response.userGroups;
	}

	/**
	 * Create a new group in the workspace
	 */
	async createGroup(params: GroupCreateParams): Promise<CreatedGroup> {
		const response = (await this._client.post("/workspace/groups", {
			body: params,
		})) as unknown as GroupCreateResponse;
		return response.group;
	}

	/**
	 * List all invites in the workspace
	 */
	async listInvites(params?: InvitesListParams): Promise<InvitesListResponse> {
		return (await this._client.get("/workspace/invites", {
			params: params as Record<string, unknown>,
		})) as unknown as InvitesListResponse;
	}

	/**
	 * Create a new invite to the workspace
	 */
	async createInvite(params: InviteCreateParams): Promise<Invite> {
		const response = (await this._client.post("/workspace/invites", {
			body: params,
		})) as unknown as InviteResponse;
		return response.invite;
	}

	/**
	 * Delete an existing invite
	 */
	async deleteInvite(id: string): Promise<InviteDeleteResponse> {
		return (await this._client.delete(
			`/workspace/invites/${id}`,
		)) as unknown as InviteDeleteResponse;
	}
}
