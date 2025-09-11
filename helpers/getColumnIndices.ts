
function distributeWords(words: string[], numColumns: number) {
  const totalWords = words.length;
  const wordsPerColumn = Math.floor(totalWords / numColumns);
  const extraWords = totalWords % numColumns;

  // First 'extraWords' columns get one extra word
  const columnSizes = [];
  for (let i = 0; i < numColumns; i++) {
    if (i < extraWords) {
      columnSizes.push(wordsPerColumn + 1);
    } else {
      columnSizes.push(wordsPerColumn);
    }
  }

  return columnSizes;
}

export function getColumnIndices(words: string[], numColumns: number) {
  const columnSizes = distributeWords(words, numColumns);

  const breakpoints = [];
  let currentIndex = 0;

  for (const size of columnSizes) {
    const startIndex = currentIndex;
    const endIndex = currentIndex + size;
    breakpoints.push(startIndex);
    currentIndex = endIndex;
  }

  return breakpoints;
}
