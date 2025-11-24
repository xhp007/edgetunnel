import type { ActionType } from '../types';

interface ProgressMeterProps {
  action: ActionType | null;
  progress: number;
  visible?: boolean;
}

const labelMap: Record<ActionType, string> = {
  'face-match': 'Running face match pipeline…',
  'description-search': 'Searching description across frames…'
};

const ProgressMeter = ({ action, progress, visible = false }: ProgressMeterProps) => {
  if (!visible || action === null) {
    return null;
  }

  const label = labelMap[action];

  return (
    <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
        <p>{label}</p>
        <span>{Math.min(progress, 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressMeter;
