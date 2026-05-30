import { fileTypeFromBuffer } from "file-type";

import { getServerEnv } from "@/src/lib/env";

export async function validatePdfUpload(file: File) {
  const env = getServerEnv();
  if (file.size <= 0) {
    throw new Error("The uploaded file is empty.");
  }
  if (file.size > env.MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds the ${Math.floor(env.MAX_UPLOAD_BYTES / 1024 / 1024)}MB upload limit.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (detected?.mime !== "application/pdf") {
    throw new Error("Only PDF files are supported in v1.");
  }

  return {
    buffer,
    mimeType: detected.mime,
    extension: ".pdf",
    safeName: sanitizeFileName(file.name || "document.pdf"),
  };
}

function sanitizeFileName(name: string) {
  const cleaned = name.replace(/[\u0000-\u001f/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 160) || "document.pdf";
}
