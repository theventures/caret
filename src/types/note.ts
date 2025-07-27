export interface NoteTag {
  id: string;
  name: string;
  color: string;
}

export interface NoteParticipant {
  name: string;
  email: string;
  profileImageUrl: string;
  accountName: string;
  accountDomain: string;
  accountImageUrl: string;
}

export interface NoteTranscript {
  speaker: string;
  text: string;
  startTimestamp: string;
  endTimestamp: string;
}

export type NoteKind = 'online' | 'in-person' | 'podcast';

export type NoteStatus = 
  | 'idle'
  | 'recording'
  | 'recorded-not-summarized'
  | 'summarizing'
  | 'transcript-processing'
  | 'completed';

export type NoteVisibility = 'private' | 'workspace' | 'shared';

export interface Note {
  id: string;
  title: string;
  kind: NoteKind;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  visibility: NoteVisibility;
  tags: NoteTag[];
  participants: NoteParticipant[];
  totalDurationSec: number;
  userWrittenNote: string;
  enhancedNote: string;
  summary: string;
  transcripts: NoteTranscript[];
}

export interface NotesListParams {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  status?: NoteStatus;
  kind?: NoteKind;
  search?: string;
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
  tagIds?: string;
  participantEmail?: string;
}

export interface NotesListResponse {
  items: Note[];
  pagination: {
    limit: number;
    nextOffset: number;
    isLast: boolean;
  };
}

export interface NoteUpdateParams {
  title?: string;
  visibility?: NoteVisibility;
  userWrittenNote?: string;
  tagIds?: string[];
}

export interface NoteResponse {
  note: Note;
}