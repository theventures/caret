# @theventures/caret

> Unofficial Node.js API client for the Caret HTTP API

[![npm version](https://badge.fury.io/js/@theventures%2Fcaret.svg)](https://www.npmjs.com/package/@theventures/caret)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Caret](https://caret.so) is a meeting transcription and note management service. This library provides a convenient way to interact with the Caret API from Node.js applications.

## Installation

```bash
npm install @theventures/caret
```

```bash
yarn add @theventures/caret
```

```bash
pnpm add @theventures/caret
```

```bash
bun add @theventures/caret
```

## Quick Start

```typescript
import { Caret } from '@theventures/caret';

const caret = new Caret({
  apiKey: 'sk-caret-api-xxxxxxxxxxxxxxxxxxxx'
});

// List all notes
const notes = await caret.notes.list();
console.log(notes);

// Get a specific note
const note = await caret.notes.get('note_id');
if (note) {
  console.log(note);
}

// List all tags
const tags = await caret.tags.list();
console.log(tags);

// Get workspace details
const workspace = await caret.workspace.get();
console.log(workspace);
```

## Authentication

You can provide your API key in several ways:

### Environment Variable (Recommended)

```bash
export CARET_API_KEY="sk-caret-api-xxxxxxxxxxxxxxxxxxxx"
```

```typescript
const caret = new Caret(); // Automatically uses CARET_API_KEY
```

### Constructor Option

```typescript
const caret = new Caret({
  apiKey: 'sk-caret-api-xxxxxxxxxxxxxxxxxxxx'
});
```

## Configuration

```typescript
const caret = new Caret({
  apiKey: 'sk-caret-api-xxxxxxxxxxxxxxxxxxxx',
  baseURL: 'https://api.caret.so/v1', // default
  timeout: 30000, // 30 seconds (default)
  maxRetries: 3 // default
});
```

## API Resources

### Notes

The notes resource allows you to manage meeting notes and transcripts.

```typescript
// List all notes with optional filtering
const notes = await caret.notes.list({
  limit: 10,
  offset: 0
});

// Retrieve a specific note
const note = await caret.notes.get('note_id');

// Update a note
const updatedNote = await caret.notes.update('note_id', {
  title: 'New Title',
  userWrittenNote: 'Updated content'
});
```

### Tags

The tags resource allows you to manage workspace tags.

```typescript
// List all tags in the workspace
const tags = await caret.tags.list();

// Create a new tag
const newTag = await caret.tags.create({
  name: 'Important',
  color: '#FF5733'
});
```

### Workspace

The workspace resource allows you to manage workspace settings and members.

```typescript
// Get workspace details
const workspace = await caret.workspace.get();
console.log(workspace.name, workspace.settings);

// List workspace members with pagination
const members = await caret.workspace.listMembers({
  limit: 50,
  offset: 0,
  search: 'john'
});

// Get a specific member
const member = await caret.workspace.getMember('member_id');
console.log(member.name, member.role, member.groups);

// Update member's group assignments
const updatedMember = await caret.workspace.updateMember('member_id', {
  groupIds: ['group_1', 'group_2']
});

// List all groups in the workspace
const groups = await caret.workspace.listGroups();
console.log(groups.map(g => ({ name: g.name, members: g.memberCount })));

// Create a new group
const newGroup = await caret.workspace.createGroup({
  name: 'Engineering Team',
  description: 'All engineering team members'
});
console.log(newGroup.id, newGroup.name);

// List all invites with pagination
const invites = await caret.workspace.listInvites({
  limit: 50,
  offset: 0
});
console.log(invites.items.map(i => ({ email: i.email, role: i.role })));

// Create a new invite
const invite = await caret.workspace.createInvite({
  email: 'newmember@example.com',
  role: 'member',
  groupIds: ['group_1', 'group_2']
});
console.log(invite.code, invite.expiresAt);

// Delete an invite
const deleteResult = await caret.workspace.deleteInvite('invite_id');
console.log(deleteResult.success, deleteResult.message);
```

## Rate Limits

The client automatically handles rate limiting based on your Caret plan:

- **Free**: 60 requests per minute
- **Pro**: 120 requests per minute  
- **Enterprise**: 300 requests per minute

When rate limits are exceeded, the client will automatically retry with exponential backoff.

## Error Handling

The library provides specific error types for different API error conditions:

```typescript
import { 
  AuthenticationError,
  CaretAPIError, 
  RateLimitError,
} from '@theventures/caret';

// Note: notes.get() returns null for 404 errors instead of throwing
const note = await caret.notes.get('invalid_id');
if (note === null) {
  console.log('Note not found');
}

// Other methods still throw errors as expected
try {
  const notes = await caret.notes.list();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof CaretAPIError) {
    console.log('API error:', error.message);
  }
}
```

## Webhooks

The library provides helpers for verifying webhook signatures to ensure webhook authenticity.

```typescript
import { WebhookVerifier } from '@theventures/caret';

// Next.js App Router example
export async function POST(request: Request) {
  // Uses CARET_WEBHOOK_SECRET env var automatically or you can pass it in the constructor
  const verifier = new WebhookVerifier(); 
  
  // Verify and parse in one step with full type safety
  const { isValid, data, error } = await verifier.verifyRequest<'note.created'>(request);
  
  if (!isValid) {
    console.error('Webhook verification failed:', error);
    return new Response('Unauthorized', { status: 401 });
  }
  
  // data is fully typed as WebhookEventMap['note.created']
  const note = data.payload.note; // Fully typed as Note
  console.log('New note created:', note.title);
  console.log('Participants:', note.participants);
  // Process the note...
  
  return new Response('OK', { status: 200 });
}
```

## TypeScript Support

This library is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  Note, 
  NoteStatus, 
  NoteVisibility, 
  Tag,
  WorkspaceType,
  Member,
  Group,
  Invite,
  WebhookEvent,
  WebhookEventMap
} from '@theventures/caret';

const note: Note | null = await caret.notes.get('note_id');
if (note) {
  console.log(note.title); // Fully typed
}

const tags: Tag[] = await caret.tags.list();
tags.forEach(tag => {
  console.log(tag.name, tag.color); // Fully typed
});

const workspace: WorkspaceType = await caret.workspace.get();
console.log(workspace.settings.defaultLanguage); // Fully typed

const member: Member = await caret.workspace.getMember('member_id');
console.log(member.role, member.groups); // Fully typed

const groups: Group[] = await caret.workspace.listGroups();
groups.forEach(group => {
  console.log(group.name, group.memberCount, group.description); // Fully typed
});

const invite: Invite = await caret.workspace.createInvite({
  email: 'new@example.com',
  role: 'member'
});
console.log(invite.code, invite.expiresAt, invite.groups); // Fully typed

// Webhook event types
const webhookEvent: WebhookEventMap['note.created'] = {
  type: 'note.created',
  eventId: 'evt_123',
  webhookId: 'wh_456',
  workspaceId: 'ws_789',
  timestamp: '2024-01-01T00:00:00Z',
  payload: {
    note: note! // Fully typed as Note
  }
};
```

## Requirements

- Node.js 18 or higher
- TypeScript 5.0 or higher (if using TypeScript)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

This is an unofficial client library. For issues with the Caret API itself, please contact [Caret support](https://caret.so).

For issues with this library:
1. Check existing [GitHub issues](https://github.com/theventures/caret/issues)
2. Create a new issue with a clear description
3. Include code examples and error messages when applicable

## Links

- [Caret Official Website](https://caret.so)
- [Caret API Documentation](https://docs.caret.so/api-reference/overview)
- [npm Package](https://www.npmjs.com/package/@theventures/caret)
- [GitHub Repository](https://github.com/theventures/caret)

## About

This package is published by [TheVentures](https://theventures.vc), the investment company behind [At Inc.](https://www.at.studio) (the company that operates Caret).

### Built with AI

This library was built entirely through **vibe coding**. The entire codebase was developed primarily using [Claude Code](https://claude.ai/code), demonstrating the power of AI-assisted development in creating production-ready software.
