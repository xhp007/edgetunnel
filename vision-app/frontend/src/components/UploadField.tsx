import { ChangeEvent, useId } from 'react';

interface UploadFieldProps {
  label: string;
  hint?: string;
  accept?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

const formatSize = (file?: File | null) => {
  if (!file) return '';
  const sizeInMb = file.size / (1024 * 1024);
  return `${sizeInMb.toFixed(2)} MB`;
};

const UploadField = ({ label, hint, accept, file, onChange }: UploadFieldProps) => {
  const inputId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    onChange(nextFile ?? null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-4 hover:border-indigo-400"
      >
        <input id={inputId} type="file" accept={accept} className="hidden" onChange={handleChange} />
        <p className="text-sm text-slate-300">{file ? file.name : hint ?? 'Choose a file'}</p>
        <p className="text-xs text-slate-500">
          {file ? formatSize(file) : 'Supports drag & drop. 2GB max.'}
        </p>
        {file && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onChange(null);
            }}
            className="self-start text-xs font-semibold text-rose-300"
          >
            Clear file
          </button>
        )}
      </label>
    </div>
  );
};

export default UploadField;
