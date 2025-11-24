import { useCallback, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import UploadField from './components/UploadField';
import ProgressMeter from './components/ProgressMeter';
import ResultPanel from './components/ResultPanel';
import { runDescriptionSearch, runFaceMatch } from './api/client';
import type { ActionType, Segment } from './types';
import { extractSegments } from './utils/segments';

const App = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [faceSegments, setFaceSegments] = useState<Segment[]>([]);
  const [descriptionSegments, setDescriptionSegments] = useState<Segment[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [progress, setProgress] = useState(0);

  const resolvedApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

  const canRunFaceMatch = Boolean(videoFile && referenceImage && activeAction === null);
  const canRunDescriptionSearch = Boolean(
    videoFile && description.trim().length > 0 && activeAction === null
  );

  const videoLabel = videoFile ? `${videoFile.name}` : 'No video uploaded yet';
  const faceLabel = referenceImage ? `${referenceImage.name}` : 'No reference selected';

  const resetProgress = () => {
    setActiveAction(null);
    setProgress(0);
  };

  const handleFaceMatch = useCallback(async () => {
    if (!videoFile) {
      toast.error('Upload a video file first.');
      return;
    }
    if (!referenceImage) {
      toast.error('A reference face image is required for face matching.');
      return;
    }

    setActiveAction('face-match');
    setProgress(0);

    try {
      const prompt = description.trim();
      const response = await runFaceMatch(
        { video: videoFile, reference: referenceImage, description: prompt || undefined },
        setProgress
      );
      const segments = extractSegments(response);
      setFaceSegments(segments);
      toast.success(`Face match finished (${segments.length} segment${segments.length === 1 ? '' : 's'})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete face match.';
      toast.error(message);
    } finally {
      resetProgress();
    }
  }, [description, referenceImage, videoFile]);

  const handleDescriptionSearch = useCallback(async () => {
    if (!videoFile) {
      toast.error('Upload a video file first.');
      return;
    }
    if (!description.trim()) {
      toast.error('Provide a clothing or accessory description to search for.');
      return;
    }

    setActiveAction('description-search');
    setProgress(0);

    try {
      const prompt = description.trim();
      const response = await runDescriptionSearch(
        { video: videoFile, description: prompt, reference: referenceImage ?? undefined },
        setProgress
      );
      const segments = extractSegments(response);
      setDescriptionSegments(segments);
      toast.success(`Found ${segments.length} matching description segment${segments.length === 1 ? '' : 's'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Description search failed.';
      toast.error(message);
    } finally {
      resetProgress();
    }
  }, [description, referenceImage, videoFile]);

  const helperText = useMemo(() => {
    if (resolvedApiBase) {
      return `Requests will target ${resolvedApiBase}`;
    }
    return 'Requests will use relative /api routes (proxied to FastAPI during dev).';
  }, [resolvedApiBase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <Toaster position="top-right" toastOptions={{ duration: 4500 }} />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
        <header className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">Vision Toolkit</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Video intelligence console</h1>
            <p className="text-sm text-slate-300 md:text-base">
              Upload a clip, optionally pin a reference face, and describe garments in natural language.
              Trigger the APIs and inspect timestamped segments inline.
            </p>
          </div>
          <p className="text-xs text-slate-400">{helperText}</p>
        </header>

        <section className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 shadow-2xl shadow-black/40">
          <div className="grid gap-6 md:grid-cols-2">
            <UploadField
              label="Video clip"
              hint="Drag & drop or browse a .mp4/.mov clip"
              accept="video/*"
              file={videoFile}
              onChange={setVideoFile}
            />
            <UploadField
              label="Reference face image"
              hint="PNG or JPG portrait"
              accept="image/*"
              file={referenceImage}
              onChange={setReferenceImage}
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="text-sm font-medium text-slate-100">
              Outfit or accessory description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Red blazer with gold buttons and white sneakers"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500">Video: {videoLabel}</p>
            <p className="text-xs text-slate-500">Reference: {faceLabel}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleFaceMatch}
              disabled={!canRunFaceMatch}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/50 bg-indigo-600/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Run face match
            </button>
            <button
              type="button"
              onClick={handleDescriptionSearch}
              disabled={!canRunDescriptionSearch}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/80 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Search by description
            </button>
          </div>

          <ProgressMeter
            action={activeAction}
            progress={progress}
            visible={activeAction !== null}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <ResultPanel
            title="Face match segments"
            segments={faceSegments}
            emptyHint="Run a face match to inspect the detected clips."
          />
          <ResultPanel
            title="Description matches"
            segments={descriptionSegments}
            emptyHint="Trigger a description search to see relevant time spans."
          />
        </section>
      </main>
    </div>
  );
};

export default App;
