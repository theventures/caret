# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is an unofficial Node.js API client for the Caret HTTP API (https://docs.caret.so/api-reference/overview). Caret is a meeting transcription and note management service.

## Development Commands

- **Install dependencies**: `bun install`
- **Run the application**: `bun run src/index.ts`
- **TypeScript compilation check**: `bun tsc --noEmit`
- **Run tests**: `bun test`
- **Run tests with coverage**: `bun test --coverage`

## API Client Architecture

The client should implement:

- **Base URL**: `https://api.caret.so/v1`
- **Authentication**: Bearer token authentication (`Authorization: Bearer sk-caret-api-xxxxxxxxxxxxxxxxxxxx`)
- **Rate limiting**: Handle different rate limits (Free: 60/min, Pro: 120/min, Enterprise: 300/min)
- **Core resources**:
  - Notes (create, read, update, delete meeting notes and transcripts)
  - Webhooks (manage real-time event notifications)
  - Workspace (manage members, invites, groups)
  - Tags (retrieve workspace tags)

## Design Patterns (Inspired by OpenAI Node.js Client)

### 1. Resource-Based Architecture
```typescript
// Main client class
class Caret {
  notes = new Notes(this);
  workspace = new Workspace(this);
  tags = new Tags(this);
  webhooks = new Webhooks(this);
}

// Base resource pattern
abstract class APIResource {
  protected _client: Caret;
  constructor(client: Caret) {
    this._client = client;
  }
}
```

### 2. Error Handling
- Hierarchical error system with specific error types
- HTTP status-based error generation
- Rich error context (status, headers, requestId)

### 3. Configuration
```typescript
const caret = new Caret({
  apiKey: process.env.CARET_API_KEY,
  baseURL: 'https://api.caret.so/v1',
  timeout: 30000,
  maxRetries: 3
});
```

### 4. Method Naming Conventions
- Consistent CRUD operations: `create()`, `retrieve()`, `update()`, `list()`, `delete()`
- Resource-specific methods following REST patterns

## API Models

TypeScript interfaces for core models:

- **Note**: id, title, kind, status, createdAt, updatedAt, visibility, tags, participants, totalDurationSec, userWrittenNote, enhancedNote, summary, transcripts
- **Workspace**: id, name, createdAt, updatedAt, settings (defaultLanguage, brandColor, enableTranscriptSharing), allowedEmailDomains, iconUrl
- **Member**: id, userId, name, email, profileUrl, role, createdAt, groups
- **Invite**: id, email, code, role, expiresAt, createdAt, isUrlInvite, groups
- **Tag**: id, name, color, createdAt
- **Group**: id, name, createdAt, memberCount, description (optional)

## Project Structure

```
src/
├── core/           # Core SDK functionality (errors, pagination, etc.)
├── resources/      # API endpoint implementations
│   ├── notes.ts
│   ├── workspace.ts
│   ├── tags.ts
│   └── webhooks.ts
├── types/          # TypeScript type definitions
├── client.ts       # Main Caret client class
└── index.ts        # Primary export point

tests/
├── __helpers__/    # Shared test utilities and mocks
├── core/           # Tests for core functionality
├── resources/      # Tests for API resources
├── client.test.ts  # Core client tests
└── errors.test.ts  # Error handling tests
```

## Implementation Guidelines

- Use TypeScript with strict typing for API responses
- Implement proper error handling for API errors and rate limits
- Support async/await patterns
- Method overloading for different parameter combinations
- Rich parameter interfaces rather than primitive types
- Generate types from API documentation where possible

## Testing

The project maintains comprehensive test coverage using Bun's built-in testing framework without additional dependencies.

### Test Coverage
- **100% line coverage** of all executable code
- **94.29% function coverage** across all components
- **Complete coverage** of client functionality, error handling, and API resources
- **Zero dependencies** - uses only `bun test` built-in capabilities

### Test Structure
- **Mock Strategy**: Uses Bun's native `mock()` function for HTTP request mocking
- **Test Organization**: Grouped by functionality (client, errors, resources, core)
- **Assertions**: Bun's built-in `expect()` API for all test assertions

### Running Tests
```bash
bun test                    # Run all tests
bun test --coverage         # Run tests with coverage report
bun tsc --noEmit           # TypeScript compilation check
```

### Test Guidelines
- All new features must include comprehensive unit tests
- Tests should cover success cases, error cases, and edge cases
- Mock external dependencies (HTTP requests) using the established patterns
- Maintain 100% line coverage for all executable code
- Strive for maximum function coverage where practical