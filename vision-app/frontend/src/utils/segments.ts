import type { Segment, VisionResponse } from '../types';

const segmentKeys = ['segments', 'results', 'matches', 'clips'];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return undefined;
};

const pickString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const match = toNumber(source[key]);
    if (typeof match === 'number') {
      return match;
    }
  }
  return undefined;
};

const normaliseItem = (item: unknown, index: number): Segment => {
  const record = (item && typeof item === 'object' ? (item as Record<string, unknown>) : { summary: String(item) }) as Record<string, unknown>;

  const idCandidate = pickString(record, ['id', 'segmentId', 'segment_id', 'uuid']);
  const clipUrl = pickString(record, ['clipUrl', 'clip_url', 'url', 'video_url', 'clip']);
  const status = pickString(record, ['status', 'state', 'label', 'result']);
  const summary = pickString(record, ['summary', 'caption', 'description', 'note']);
  const timestampLabel = pickString(record, ['timestamp', 'timecode', 'range']);
  const score = pickNumber(record, ['score', 'confidence', 'match_score']);
  const startSeconds = pickNumber(record, ['startSeconds', 'start', 'start_seconds', 'start_time']);
  const endSeconds = pickNumber(record, ['endSeconds', 'end', 'end_seconds', 'end_time']);

  return {
    id: idCandidate ?? `segment-${index}`,
    clipUrl,
    status,
    summary,
    timestampLabel,
    score,
    startSeconds,
    endSeconds,
    metadata: record
  };
};

const normaliseArray = (items: unknown[]): Segment[] => {
  return items.map((item, index) => normaliseItem(item, index));
};

const tryExtract = (value: unknown): Segment[] | null => {
  if (Array.isArray(value)) {
    return normaliseArray(value);
  }
  return null;
};

export const extractSegments = (payload: VisionResponse | Segment[] | unknown): Segment[] => {
  const direct = tryExtract(payload);
  if (direct) {
    return direct;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  for (const key of segmentKeys) {
    const match = tryExtract((payload as Record<string, unknown>)[key]);
    if (match) {
      return match;
    }
  }

  const nested = (payload as Record<string, unknown>).data;
  if (nested && typeof nested === 'object') {
    for (const key of segmentKeys) {
      const match = tryExtract((nested as Record<string, unknown>)[key]);
      if (match) {
        return match;
      }
    }
  }

  return [];
};

const secondsToClock = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export const formatSegmentTimestamp = (segment: Segment): string => {
  if (segment.timestampLabel) {
    return segment.timestampLabel;
  }
  const start = typeof segment.startSeconds === 'number' ? secondsToClock(segment.startSeconds) : undefined;
  const end = typeof segment.endSeconds === 'number' ? secondsToClock(segment.endSeconds) : undefined;

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return end;
  }
  return 'Timestamp unavailable';
};
