import { describe, expect, it } from "vitest";

import { chunkPages } from "@/src/rag/chunker";

describe("chunkPages", () => {
  it("creates page-scoped chunks with metadata", () => {
    const chunks = chunkPages([
      { pageNumber: 1, text: "Introducción\n\nEste es el primer párrafo." },
      { pageNumber: 2, text: "Segunda página con información relevante." },
    ]);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({ pageNumber: 1, chunkIndex: 0 });
    expect(chunks[1]).toMatchObject({ pageNumber: 2, chunkIndex: 1 });
    expect(chunks[0].metadata.strategy).toBe("paragraph-window");
  });

  it("splits long text and keeps chunks below the max size", () => {
    const chunks = chunkPages([{ pageNumber: 1, text: "a".repeat(3500) }], 1000, 100);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.text.length <= 1000)).toBe(true);
  });
});
