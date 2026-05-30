import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { getServerEnv } from "@/src/lib/env";
import { createId } from "@/src/lib/ids";

const env = getServerEnv();
const storageRoot = path.resolve(env.FILE_STORAGE_DIR);

export async function ensureStorageRoot() {
  await mkdir(storageRoot, { recursive: true, mode: 0o700 });
}

export function getStorageRoot() {
  return storageRoot;
}

export async function savePrivateUpload(buffer: Buffer, extension = ".pdf") {
  await ensureStorageRoot();
  const fileName = `${createId("file")}${extension}`;
  const absolutePath = path.join(storageRoot, fileName);
  await writeFile(absolutePath, buffer, { mode: 0o600 });
  return absolutePath;
}

export async function readPrivateFile(absolutePath: string) {
  assertInsideStorage(absolutePath);
  return readFile(absolutePath);
}

export async function deletePrivateFile(absolutePath: string) {
  assertInsideStorage(absolutePath);
  await rm(absolutePath, { force: true });
}

function assertInsideStorage(absolutePath: string) {
  const resolved = path.resolve(absolutePath);
  if (!resolved.startsWith(`${storageRoot}${path.sep}`)) {
    throw new Error("Refusing to access a file outside the private storage directory.");
  }
}
