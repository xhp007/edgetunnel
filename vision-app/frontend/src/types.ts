export type ActionType = 'face-match' | 'description-search';

export interface Segment {
  id: string;
  status?: string;
  timestampLabel?: string;
  startSeconds?: number;
  endSeconds?: number;
  clipUrl?: string;
  score?: number;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface VisionResponse {
  message?: string;
  detail?: string;
  segments?: unknown;
  results?: unknown;
  matches?: unknown;
  data?: unknown;
  [key: string]: unknown;
}
