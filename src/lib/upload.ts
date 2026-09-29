import { api, API_BASE, ApiError } from "@/lib/api";
import type { UploadKind } from "@/hooks/use-showcase";

/**
 * Upload one launch file. It goes to our API, which checks it and stores it in
 * S3 (served from CloudFront). XHR rather than fetch so we get upload progress.
 * Resolves with the file's public URL.
 */
export async function uploadLaunchMedia(
  kind: UploadKind,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/showcase/uploads`);
    const token = api.getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body: { public_url?: string; detail?: unknown } = {};
      try {
        body = JSON.parse(xhr.responseText || "{}");
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.public_url) resolve(body.public_url);
      else if (xhr.status === 413) reject(new Error("That file is too big."));
      else reject(new ApiError(xhr.status, body));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(form);
  });
}
