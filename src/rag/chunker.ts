export interface PageForChunking {
  pageNumber: number;
  text: string;
}

export interface DocumentChunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  metadata: {
    charLength: number;
    strategy: "paragraph-window";
  };
}

export function chunkPages(pages: PageForChunking[], maxChars = 1400, overlapChars = 180) {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const normalized = normalizeWhitespace(page.text);
    if (!normalized) continue;

    const paragraphs = normalized.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    let current = "";

    for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
      if (paragraph.length > maxChars) {
        if (current) {
          chunks.push(createChunk(page.pageNumber, chunkIndex++, current));
          current = tail(current, overlapChars);
        }
        for (const piece of splitLongText(paragraph, maxChars, overlapChars)) {
          chunks.push(createChunk(page.pageNumber, chunkIndex++, piece));
        }
        continue;
      }

      const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
      if (candidate.length <= maxChars) {
        current = candidate;
        continue;
      }

      if (current) {
        chunks.push(createChunk(page.pageNumber, chunkIndex++, current));
      }
      current = `${tail(current, overlapChars)}${tail(current, overlapChars) ? "\n\n" : ""}${paragraph}`.trim();
    }

    if (current) {
      chunks.push(createChunk(page.pageNumber, chunkIndex++, current));
    }
  }

  return chunks;
}

function createChunk(pageNumber: number, chunkIndex: number, text: string): DocumentChunk {
  const clean = text.trim();
  return {
    pageNumber,
    chunkIndex,
    text: clean,
    metadata: {
      charLength: clean.length,
      strategy: "paragraph-window",
    },
  };
}

function normalizeWhitespace(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLongText(text: string, maxChars: number, overlapChars: number) {
  const pieces: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    pieces.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = Math.max(0, end - overlapChars);
  }
  return pieces.filter(Boolean);
}

function tail(text: string, overlapChars: number) {
  if (!text || overlapChars <= 0) return "";
  return text.slice(Math.max(0, text.length - overlapChars)).trim();
}
