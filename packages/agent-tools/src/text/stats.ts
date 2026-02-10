import type { TextStats } from './types';

export function getTextStats(input: string): TextStats {
  const characters = input.length;

  const words = input
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const sentences = input
    .split(/[.!?](?:\s|$)/)
    .filter((sentence) => sentence.trim().length > 0);

  const paragraphs = input
    .split(/\n\n+/)
    .filter((paragraph) => paragraph.trim().length > 0);

  const lines = input.split(/\n/);

  // 200 words per minute average reading speed
  const readingTimeMs = (words.length / 200) * 60 * 1000;

  return {
    characters,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    lines: lines.length,
    readingTimeMs,
  };
}
