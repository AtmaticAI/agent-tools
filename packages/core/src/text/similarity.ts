import type { SimilarityResult } from './types';

export function similarity(a: string, b: string): SimilarityResult {
  // Handle edge cases
  if (a === b) {
    return { distance: 0, similarity: 1.0 };
  }

  if (a.length === 0) {
    return { distance: b.length, similarity: 0 };
  }

  if (b.length === 0) {
    return { distance: a.length, similarity: 0 };
  }

  // Wagner-Fischer algorithm for Levenshtein distance
  const m = a.length;
  const n = b.length;

  // Create a 2D matrix (m+1) x (n+1)
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1);
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  const distance = dp[m][n];
  const maxLength = Math.max(m, n);
  const sim = 1 - distance / maxLength;

  return { distance, similarity: sim };
}
