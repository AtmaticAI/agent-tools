import { XMLParser } from 'fast-xml-parser';
import type { XmlStats } from './types';

export function getStats(input: string): XmlStats {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const parsed = parser.parse(input);
  const stats: XmlStats = {
    elements: 0,
    attributes: 0,
    textNodes: 0,
    depth: 0,
    sizeBytes: Buffer.byteLength(input, 'utf8'),
  };

  countNodes(parsed, 0, stats);
  return stats;
}

function countNodes(
  obj: unknown,
  depth: number,
  stats: XmlStats
): void {
  if (obj === null || obj === undefined) return;

  if (typeof obj !== 'object') {
    stats.textNodes++;
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      countNodes(item, depth, stats);
    }
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key.startsWith('@_')) {
      stats.attributes++;
    } else if (key === '#text') {
      stats.textNodes++;
    } else {
      stats.elements++;
      stats.depth = Math.max(stats.depth, depth + 1);
      countNodes(value, depth + 1, stats);
    }
  }
}
