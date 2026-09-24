import { api } from "@/lib/api";
import type { UploadKind } from "@/hooks/use-showcase";

interface PresignedUpload {
  upload_url: string;
  public_url: string;
  headers: Record<string, string>;
}

/**
 * Upload one launch file straight to storage.
 * 1. Ask the API for a presigned URL (it checks type and size).
 * 2. PUT the file to that URL. XHR rather than fetch so we get upload progress.
 * Resolves with the file's public URL.
 */
export async function uploadLaunchMedia(
  kind: UploadKind,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const presigned = await api.post<PresignedUpload>("/showcase/uploads", {
    kind,
    content_type: file.type,
    size: file.size,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presigned.upload_url);
    for (const [header, value] of Object.entries(presigned.headers)) xhr.setRequestHeader(header, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(file);
  });

  return presigned.public_url;
}
