import { APIResource } from "../core/resource.js";
import type {
	Tag,
	TagCreateParams,
	TagResponse,
	TagsListResponse,
} from "../types/tags.js";

export class Tags extends APIResource {
	/**
	 * Retrieve a list of all tags in the workspace
	 */
	async list(): Promise<Tag[]> {
		const response = (await this._client.get(
			"/workspace/tags",
		)) as unknown as TagsListResponse;
		return response.tags;
	}

	/**
	 * Create a new tag in the workspace
	 */
	async create(params: TagCreateParams): Promise<Tag> {
		const response = (await this._client.post("/workspace/tags", {
			body: params,
		})) as unknown as TagResponse;
		return response.tag;
	}
}
