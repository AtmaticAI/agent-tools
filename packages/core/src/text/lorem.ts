const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat',
];

function getWord(index: number): string {
  return LOREM_WORDS[index % LOREM_WORDS.length];
}

function generateSentence(wordOffset: number): { sentence: string; nextOffset: number } {
  // Generate a sentence with 8-15 words
  const wordCount = 8 + (wordOffset % 8); // Deterministic 8-15 range
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    words.push(getWord(wordOffset + i));
  }

  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  return {
    sentence: words.join(' ') + '.',
    nextOffset: wordOffset + wordCount,
  };
}

export function generateLorem(
  count: number,
  unit: 'words' | 'sentences' | 'paragraphs' = 'words',
): string {
  if (count <= 0) {
    return '';
  }

  if (unit === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(getWord(i));
    }
    return words.join(' ');
  }

  if (unit === 'sentences') {
    const sentences: string[] = [];
    let offset = 0;
    for (let i = 0; i < count; i++) {
      const { sentence, nextOffset } = generateSentence(offset);
      sentences.push(sentence);
      offset = nextOffset;
    }
    return sentences.join(' ');
  }

  // paragraphs
  const paragraphs: string[] = [];
  let offset = 0;

  for (let i = 0; i < count; i++) {
    const sentenceCount = 3 + (i % 4); // Deterministic 3-6 range
    const sentences: string[] = [];

    for (let j = 0; j < sentenceCount; j++) {
      const { sentence, nextOffset } = generateSentence(offset);
      sentences.push(sentence);
      offset = nextOffset;
    }

    paragraphs.push(sentences.join(' '));
  }

  return paragraphs.join('\n\n');
}
