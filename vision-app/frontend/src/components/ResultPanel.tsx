import type { Segment } from '../types';
import { formatSegmentTimestamp } from '../utils/segments';

interface ResultPanelProps {
  title: string;
  segments: Segment[];
  emptyHint: string;
}

const statusColors: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20',
  match: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20',
  pending: 'bg-amber-500/20 text-amber-200 border-amber-500/20',
  reviewing: 'bg-sky-500/20 text-sky-200 border-sky-500/20',
  default: 'bg-slate-700/40 text-slate-200 border-slate-600/60'
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return null;
  }
  const key = status.toLowerCase();
  const className = statusColors[key] ?? statusColors.default;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {status}
    </span>
  );
};

const ResultPanel = ({ title, segments, emptyHint }: ResultPanelProps) => {
  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/50 p-5 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">{segments.length}</span>
      </div>
      {segments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{emptyHint}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {segments.map((segment) => (
            <article
              key={segment.id}
              className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <StatusBadge status={segment.status} />
                <span className="font-medium text-slate-100">{formatSegmentTimestamp(segment)}</span>
                {typeof segment.score === 'number' && (
                  <span className="text-xs text-slate-400">
                    {segment.score <= 1
                      ? `${(segment.score * 100).toFixed(1)}% confidence`
                      : `Score ${segment.score.toFixed(1)}`}
                  </span>
                )}
              </div>
              {segment.summary && <p className="text-sm text-slate-200">{segment.summary}</p>}
              {segment.clipUrl ? (
                <video
                  controls
                  src={segment.clipUrl}
                  className="w-full rounded-2xl border border-slate-800 bg-black"
                />
              ) : (
                <p className="text-xs text-slate-500">No clip URL returned for this segment.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResultPanel;
