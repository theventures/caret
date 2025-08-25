export interface Tag {
	id: string;
	name: string;
	color: string;
	createdAt: string;
}

export interface TagsListResponse {
	tags: Tag[];
}

export interface TagCreateParams {
	name: string;
	color: string;
}

export interface TagResponse {
	tag: Tag;
}
