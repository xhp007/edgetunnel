import type { VisionResponse } from '../types';

export type ProgressHandler = (progress: number) => void;

interface BasePayload {
  video?: File | null;
  reference?: File | null;
  description?: string;
}

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

const resolveUrl = (endpoint: string) => {
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE_URL ? `${API_BASE_URL}${safeEndpoint}` : safeEndpoint;
};

const sendMultipart = async (
  endpoint: string,
  payload: Record<string, string | Blob | File | undefined>,
  onProgress?: ProgressHandler
): Promise<VisionResponse> => {
  const url = resolveUrl(endpoint);
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, value.toString());
    }
  });

  return await new Promise<VisionResponse>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.responseType = 'text';

    request.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      } else {
        onProgress(50);
      }
    };

    request.onerror = () => {
      reject(new Error('Network error while contacting the vision API.'));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(parseResponse(request.responseText));
      } else {
        reject(new Error(request.responseText || `Request failed with status ${request.status}`));
      }
    };

    request.send(formData);
  });
};

const parseResponse = (body: string | null): VisionResponse => {
  if (!body) {
    return {};
  }
  try {
    return JSON.parse(body) as VisionResponse;
  } catch (error) {
    console.warn('Unable to parse API response as JSON', error);
    return { message: body };
  }
};

export interface FaceMatchPayload extends BasePayload {
  video: File;
  reference: File;
}

export interface DescriptionSearchPayload extends BasePayload {
  video: File;
  description: string;
}

export const runFaceMatch = (
  payload: FaceMatchPayload,
  onProgress?: ProgressHandler
): Promise<VisionResponse> => {
  return sendMultipart('/api/face-match', payload, onProgress);
};

export const runDescriptionSearch = (
  payload: DescriptionSearchPayload,
  onProgress?: ProgressHandler
): Promise<VisionResponse> => {
  return sendMultipart('/api/description-search', payload, onProgress);
};
