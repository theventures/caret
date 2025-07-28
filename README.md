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
console.log(note);
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
  CaretAPIError, 
  RateLimitError, 
  AuthenticationError,
  NotFoundError 
} from '@theventures/caret';

try {
  const note = await caret.notes.get('invalid_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Note not found');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof CaretAPIError) {
    console.log('API error:', error.message);
  }
}
```

## TypeScript Support

This library is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { Note, NoteStatus, NoteVisibility } from '@theventures/caret';

const note: Note = await caret.notes.get('note_id');
console.log(note.title); // Fully typed
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
