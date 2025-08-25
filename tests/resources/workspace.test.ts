import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Caret } from "../../src/client.js";
import { BadRequestError, NotFoundError } from "../../src/core/errors.js";
import { Workspace } from "../../src/resources/workspace.js";
import type { ResponseBody } from "../../src/types/common.js";
import type {
	CreatedGroup,
	Group,
	GroupCreateParams,
	GroupReference,
	Member,
	MembersListParams,
	MembersListResponse,
	MemberUpdateParams,
	Workspace as WorkspaceType,
} from "../../src/types/workspace.js";
import {
	castMockToFetch,
	createMockErrorResponse,
	createMockResponse,
} from "../__helpers__/mocks.js";

const sampleWorkspace: WorkspaceType = {
	id: "01887270-workspace-id",
	name: "Acme Corp",
	createdAt: "2023-01-15T10:30:00Z",
	updatedAt: "2024-01-20T15:45:00Z",
	settings: {
		defaultLanguage: "en",
		brandColor: "#FF5733",
		enableTranscriptSharing: true,
	},
	allowedEmailDomains: ["acme.com", "acme.io"],
	iconUrl: "https://example.com/icon.png",
};

const sampleMember: Member = {
	id: "01887270-member-id",
	userId: "user-123",
	name: "John Doe",
	email: "john@acme.com",
	profileUrl: "https://example.com/profile.jpg",
	role: "admin",
	createdAt: "2023-02-15T10:30:00Z",
	groups: [
		{ id: "group-1", name: "Engineering" },
		{ id: "group-2", name: "Leadership" },
	] as GroupReference[],
};

const sampleMembersListResponse: MembersListResponse = {
	items: [
		sampleMember,
		{
			id: "01887270-member-2",
			userId: "user-456",
			name: "Jane Smith",
			email: "jane@acme.com",
			profileUrl: null,
			role: "member",
			createdAt: "2023-03-20T14:20:00Z",
			groups: [{ id: "group-1", name: "Engineering" }],
		},
	],
	pagination: {
		limit: 20,
		nextOffset: 20,
		isLast: false,
	},
};

const sampleGroup: Group = {
	id: "01887270-group-id",
	name: "Engineering",
	createdAt: "2023-01-20T10:00:00Z",
	memberCount: 15,
	description: "Engineering team members",
};

const sampleGroupsListResponse = {
	userGroups: [
		sampleGroup,
		{
			id: "01887270-group-2",
			name: "Marketing",
			createdAt: "2023-02-15T14:30:00Z",
			memberCount: 8,
		},
		{
			id: "01887270-group-3",
			name: "Sales",
			createdAt: "2023-03-10T09:15:00Z",
			memberCount: 12,
			description: "Sales team",
		},
	],
};

describe("Workspace Resource", () => {
	let originalFetch: typeof globalThis.fetch;
	let client: Caret;
	let workspace: Workspace;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		client = new Caret({ apiKey: "sk-test-key" });
		workspace = client.workspace;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe("get()", () => {
		test("should get workspace details", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { workspace: sampleWorkspace } }),
				),
			);

			const result = await workspace.get();

			expect(result).toEqual(sampleWorkspace);
		});

		test("should call correct endpoint", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({ data: { workspace: sampleWorkspace } });
				}),
			);

			await workspace.get();

			expect(calledUrl).toBe("https://api.caret.so/v1/workspace");
			expect(calledMethod).toBe("GET");
		});

		test("should include authorization header", async () => {
			let authHeader = "";
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					authHeader =
						(options.headers as Record<string, string>)?.Authorization || "";
					return createMockResponse({ data: { workspace: sampleWorkspace } });
				}),
			);

			await workspace.get();

			expect(authHeader).toBe("Bearer sk-test-key");
		});

		test("should handle 401 authentication error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(401, { message: "Invalid API key" }),
				),
			);

			await expect(workspace.get()).rejects.toThrow("Invalid API key");
		});

		test("should handle 500 server error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(500, { message: "Internal server error" }),
				),
			);

			await expect(workspace.get()).rejects.toThrow("Internal server error");
		});
	});

	describe("listMembers()", () => {
		test("should list all members in the workspace", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({
						data: sampleMembersListResponse as unknown as ResponseBody,
					}),
				),
			);

			const result = await workspace.listMembers();

			expect(result).toEqual(sampleMembersListResponse);
			expect(result.items).toHaveLength(2);
			expect(result.pagination.limit).toBe(20);
		});

		test("should pass query parameters correctly", async () => {
			let calledUrl = "";
			const params: MembersListParams = {
				limit: 50,
				offset: 10,
				search: "john",
			};

			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({
						data: sampleMembersListResponse as unknown as ResponseBody,
					});
				}),
			);

			await workspace.listMembers(params);

			expect(calledUrl).toContain("limit=50");
			expect(calledUrl).toContain("offset=10");
			expect(calledUrl).toContain("search=john");
		});

		test("should call correct endpoint", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({
						data: sampleMembersListResponse as unknown as ResponseBody,
					});
				}),
			);

			await workspace.listMembers();

			expect(calledUrl).toContain("https://api.caret.so/v1/workspace/members");
			expect(calledMethod).toBe("GET");
		});

		test("should handle empty members list", async () => {
			const emptyResponse: MembersListResponse = {
				items: [],
				pagination: {
					limit: 20,
					nextOffset: 0,
					isLast: true,
				},
			};

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({
						data: emptyResponse as unknown as ResponseBody,
					}),
				),
			);

			const result = await workspace.listMembers();

			expect(result.items).toEqual([]);
			expect(result.pagination.isLast).toBe(true);
		});

		test("should handle search parameter", async () => {
			let calledUrl = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string) => {
					calledUrl = url;
					return createMockResponse({
						data: sampleMembersListResponse as unknown as ResponseBody,
					});
				}),
			);

			await workspace.listMembers({ search: "test@example.com" });

			expect(calledUrl).toContain("search=test%40example.com");
		});
	});

	describe("getMember()", () => {
		const memberId = "01887270-member-id";

		test("should get a specific member by ID", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { member: sampleMember } }),
				),
			);

			const result = await workspace.getMember(memberId);

			expect(result).toEqual(sampleMember);
		});

		test("should call correct endpoint with member ID", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({ data: { member: sampleMember } });
				}),
			);

			await workspace.getMember(memberId);

			expect(calledUrl).toBe(
				`https://api.caret.so/v1/workspace/members/${memberId}`,
			);
			expect(calledMethod).toBe("GET");
		});

		test("should handle 404 not found error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(404, { message: "Member not found" }),
				),
			);

			await expect(workspace.getMember("invalid-id")).rejects.toThrow(
				NotFoundError,
			);
		});

		test("should handle member with no groups", async () => {
			const memberNoGroups: Member = {
				...sampleMember,
				groups: [],
			};

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { member: memberNoGroups } }),
				),
			);

			const result = await workspace.getMember(memberId);

			expect(result.groups).toEqual([]);
		});

		test("should handle member with null profile URL", async () => {
			const memberNoProfile: Member = {
				...sampleMember,
				profileUrl: null,
			};

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { member: memberNoProfile } }),
				),
			);

			const result = await workspace.getMember(memberId);

			expect(result.profileUrl).toBeNull();
		});
	});

	describe("updateMember()", () => {
		const memberId = "01887270-member-id";
		const updateParams: MemberUpdateParams = {
			groupIds: ["group-1", "group-2", "group-3"],
		};

		test("should update a member's group assignments", async () => {
			const updatedMember: Member = {
				...sampleMember,
				groups: [
					{ id: "group-1", name: "Engineering" },
					{ id: "group-2", name: "Leadership" },
					{ id: "group-3", name: "Product" },
				],
			};

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { member: updatedMember } }),
				),
			);

			const result = await workspace.updateMember(memberId, updateParams);

			expect(result).toEqual(updatedMember);
			expect(result.groups).toHaveLength(3);
		});

		test("should send correct request body", async () => {
			let requestBody = "";
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					requestBody = options.body as string;
					return createMockResponse({ data: { member: sampleMember } });
				}),
			);

			await workspace.updateMember(memberId, updateParams);

			expect(JSON.parse(requestBody)).toEqual(updateParams);
		});

		test("should call correct endpoint with PATCH method", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({ data: { member: sampleMember } });
				}),
			);

			await workspace.updateMember(memberId, updateParams);

			expect(calledUrl).toBe(
				`https://api.caret.so/v1/workspace/members/${memberId}`,
			);
			expect(calledMethod).toBe("PATCH");
		});

		test("should include correct headers", async () => {
			let headers: Record<string, string> = {};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					headers = options.headers as Record<string, string>;
					return createMockResponse({ data: { member: sampleMember } });
				}),
			);

			await workspace.updateMember(memberId, updateParams);

			expect(headers.Authorization).toBe("Bearer sk-test-key");
			expect(headers["Content-Type"]).toBe("application/json");
		});

		test("should handle validation errors", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(400, {
						message: "Invalid group IDs",
						errors: {
							groupIds: "One or more group IDs are invalid",
						},
					}),
				),
			);

			await expect(
				workspace.updateMember(memberId, { groupIds: ["invalid-group"] }),
			).rejects.toThrow(BadRequestError);
		});

		test("should handle permission denied error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(403, {
						message: "You don't have permission to update this member",
					}),
				),
			);

			await expect(
				workspace.updateMember(memberId, updateParams),
			).rejects.toThrow("You don't have permission to update this member");
		});

		test("should handle empty group assignments", async () => {
			const emptyGroupParams: MemberUpdateParams = {
				groupIds: [],
			};

			const memberNoGroups: Member = {
				...sampleMember,
				groups: [],
			};

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({ data: { member: memberNoGroups } }),
				),
			);

			const result = await workspace.updateMember(memberId, emptyGroupParams);

			expect(result.groups).toEqual([]);
		});

		test("should handle rate limit error", async () => {
			// Use a client with no retries to avoid timeout in tests
			const noRetryClient = new Caret({ apiKey: "sk-test-key", maxRetries: 0 });
			const noRetryWorkspace = noRetryClient.workspace;

			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(
						429,
						{ message: "Rate limit exceeded" },
						{ "Retry-After": "60" },
					),
				),
			);

			await expect(
				noRetryWorkspace.updateMember(memberId, updateParams),
			).rejects.toThrow("Rate limit exceeded");
		});
	});

	describe("listGroups()", () => {
		test("should list all groups in the workspace", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({
						data: sampleGroupsListResponse as unknown as ResponseBody,
					}),
				),
			);

			const result = await workspace.listGroups();

			expect(result).toEqual(sampleGroupsListResponse.userGroups);
			expect(result).toHaveLength(3);
			expect(result[0]?.name).toBe("Engineering");
		});

		test("should call correct endpoint", async () => {
			let calledUrl = "";
			let calledMethod = "";
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					return createMockResponse({
						data: sampleGroupsListResponse as unknown as ResponseBody,
					});
				}),
			);

			await workspace.listGroups();

			expect(calledUrl).toBe("https://api.caret.so/v1/workspace/groups");
			expect(calledMethod).toBe("GET");
		});

		test("should handle empty groups list", async () => {
			const emptyResponse = { userGroups: [] };
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({
						data: emptyResponse as unknown as ResponseBody,
					}),
				),
			);

			const result = await workspace.listGroups();

			expect(result).toEqual([]);
		});

		test("should handle groups with and without descriptions", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockResponse({
						data: sampleGroupsListResponse as unknown as ResponseBody,
					}),
				),
			);

			const result = await workspace.listGroups();

			expect(result[0]?.description).toBe("Engineering team members");
			expect(result[1]?.description).toBeUndefined();
			expect(result[2]?.description).toBe("Sales team");
		});

		test("should handle authentication error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(401, { message: "Invalid API key" }),
				),
			);

			await expect(workspace.listGroups()).rejects.toThrow("Invalid API key");
		});
	});

	describe("createGroup()", () => {
		const createParams: GroupCreateParams = {
			name: "New Team",
			description: "A newly created team",
		};

		test("should create a new group", async () => {
			const newGroup: CreatedGroup = {
				id: "01887270-new-group",
				name: "New Team",
				createdAt: "2024-01-15T10:00:00Z",
				description: "A newly created team",
			};

			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: { group: newGroup } })),
			);

			const result = await workspace.createGroup(createParams);

			expect(result).toEqual(newGroup);
			expect(result.name).toBe("New Team");
		});

		test("should create group without description", async () => {
			const paramsNoDesc: GroupCreateParams = {
				name: "Simple Team",
			};
			const newGroup: CreatedGroup = {
				id: "01887270-simple-group",
				name: "Simple Team",
				createdAt: "2024-01-15T10:00:00Z",
			};

			globalThis.fetch = castMockToFetch(
				mock(async () => createMockResponse({ data: { group: newGroup } })),
			);

			const result = await workspace.createGroup(paramsNoDesc);

			expect(result).toEqual(newGroup);
			expect(result.description).toBeUndefined();
		});

		test("should call correct endpoint with POST method", async () => {
			let calledUrl = "";
			let calledMethod = "";
			let requestBody = "";
			const createdGroup: CreatedGroup = {
				id: sampleGroup.id,
				name: sampleGroup.name,
				createdAt: sampleGroup.createdAt,
				description: sampleGroup.description,
			};
			globalThis.fetch = castMockToFetch(
				mock(async (url: string, options: RequestInit) => {
					calledUrl = url;
					calledMethod = options.method || "";
					requestBody = options.body as string;
					return createMockResponse({
						data: { group: createdGroup },
					});
				}),
			);

			await workspace.createGroup(createParams);

			expect(calledUrl).toBe("https://api.caret.so/v1/workspace/groups");
			expect(calledMethod).toBe("POST");
			expect(JSON.parse(requestBody)).toEqual(createParams);
		});

		test("should include correct headers", async () => {
			let headers: Record<string, string> = {};
			const createdGroup: CreatedGroup = {
				id: sampleGroup.id,
				name: sampleGroup.name,
				createdAt: sampleGroup.createdAt,
				description: sampleGroup.description,
			};
			globalThis.fetch = castMockToFetch(
				mock(async (_url: string, options: RequestInit) => {
					headers = options.headers as Record<string, string>;
					return createMockResponse({ data: { group: createdGroup } });
				}),
			);

			await workspace.createGroup(createParams);

			expect(headers.Authorization).toBe("Bearer sk-test-key");
			expect(headers["Content-Type"]).toBe("application/json");
		});

		test("should handle validation errors", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(400, {
						message: "Invalid group name",
						errors: {
							name: "Name must be between 1 and 100 characters",
						},
					}),
				),
			);

			await expect(workspace.createGroup({ name: "" })).rejects.toThrow(
				BadRequestError,
			);
		});

		test("should handle duplicate group name error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(409, {
						message: "A group with this name already exists",
					}),
				),
			);

			await expect(
				workspace.createGroup({ name: "Engineering" }),
			).rejects.toThrow("A group with this name already exists");
		});

		test("should handle permission denied error", async () => {
			globalThis.fetch = castMockToFetch(
				mock(async () =>
					createMockErrorResponse(403, {
						message: "Only admins can create groups",
					}),
				),
			);

			await expect(workspace.createGroup(createParams)).rejects.toThrow(
				"Only admins can create groups",
			);
		});
	});

	describe("integration with Caret client", () => {
		test("should access workspace through client instance", () => {
			expect(client.workspace).toBeInstanceOf(Workspace);
			expect(client.workspace).toBe(workspace);
		});

		test("should share client configuration", () => {
			const customClient = new Caret({
				apiKey: "custom-key",
				baseURL: "https://custom.api.caret.so/v1",
			});

			expect(customClient.workspace).toBeInstanceOf(Workspace);
		});
	});
});
