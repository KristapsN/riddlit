import { GridCellProps } from "./generateGrid";

function isSafeToPlace(
  letterToPlace: string,
  x: number,
  y: number,
  size: number,
  wordsToAvoid: string[],
  getCellAt: (x: number, y: number) => GridCellProps | undefined
): boolean {
  const allDirections = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
  ];

  for (const word of wordsToAvoid) {
    const upperWord = word.toUpperCase();
    // Check if the new letter can be any part of the word we want to avoid.
    for (let i = 0; i < upperWord.length; i++) {
      if (upperWord[i] === letterToPlace) {
        // If the letter matches, check if this placement completes the word in any direction.
        for (const dir of allDirections) {
          let formedWord = "";
          let wordCouldBeFormed = true;

          for (let j = 0; j < upperWord.length; j++) {
            const checkX = x + (j - i) * dir.x;
            const checkY = y + (j - i) * dir.y;

            // If we are checking the position of the new letter itself.
            if (checkX === x && checkY === y) {
              formedWord += letterToPlace;
            } else {
              // Check grid bounds.
              if (checkX < 0 || checkY < 0 || checkX >= size || checkY >= size) {
                wordCouldBeFormed = false;
                break;
              }
              const cell = getCellAt(checkX, checkY);
              // If the cell is empty or has the wrong letter, this word isn't formed.
              if (!cell?.letter) {
                wordCouldBeFormed = false;
                break;
              }
              formedWord += cell.letter;
            }
          }

          if (wordCouldBeFormed && formedWord === upperWord) {
            return false; // Not safe, a forbidden word was formed.
          }
        }
      }
    }
  }
  return true; // It's safe to place the letter.
}

function Words(grid: GridCellProps[], words: string[], size: number, fillerLetters?: string): GridCellProps[][] | { error: string } {
  // Clone the grid to not modify the original
  const workingGrid = [...grid];
  const directions = [
    { x: 1, y: 0 },    // right
    { x: 0, y: 1 },    // down
    { x: 1, y: 1 },    // diagonal down-right
    // { x: -1, y: 0 },   // left
    // { x: 0, y: -1 },   // up
    // { x: -1, y: -1 },  // diagonal up-left
    { x: 1, y: -1 },   // diagonal up-right
    // { x: -1, y: 1 }    // diagonal down-left
  ];

  // Sort words by length (longest first) to place longer words first
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  // Result array to store arrays of placed word cells
  const result = [];

  // Determine cell at specific coordinates
  const getCellAt = (x: number, y: number) => {
    return workingGrid.find(cell => cell.x === x * 10 && cell.y === y * 10);
  };

  // Check if a word can be placed at a specific position in a specific direction
  const canPlaceWord = (word: string, startX: number, startY: number, dirX: number, dirY: number) => {
    if (startX < 0 || startY < 0 || startX >= size || startY >= size) return false;

    let hasOverlap = false; // To check if there's at least one overlap

    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dirX;
      const y = startY + i * dirY;

      // Check if position is out of bounds
      if (x < 0 || y < 0 || x >= size || y >= size) return false;

      const cell = getCellAt(x, y);

      // Check if cell is already occupied with a different letter
      if (cell && cell.letter && cell.letter !== word[i].toUpperCase()) {
        return false;
      }

      // Check if there's an overlap with the same letter
      if (cell && cell.letter === word[i].toUpperCase()) {
        hasOverlap = true;
      }
    }

    // If this is not the first word, prefer positions with overlaps
    if (result.length > 0 && !hasOverlap) {
      // Lower chance of accepting a position without overlap
      return Math.random() < 0.3; // 30% chance to accept a non-overlapping position
    }

    return true;
  };

  // Place a word in the grid
  const placeWord = (word: string, startX: number, startY: number, dirX: number, dirY: number) => {
    const placedCells: { id: string; x: number; y: number; letter: string; }[] = [];

    for (let i = 0; i < word.length; i++) {
      const x = startX + i * dirX;
      const y = startY + i * dirY;
      const cell = getCellAt(x, y);

      if (cell) {
        // If the cell already has this letter, it's already part of another word
        const isNewLetter = cell.letter !== word[i].toUpperCase();

        cell.letter = word[i].toUpperCase();

        // Only add to placedCells if it's not already tracked
        if (isNewLetter || !placedCells.some(c => c.id === cell.id)) {
          placedCells.push({ ...cell }); // Create a copy of the cell
        }
      }
    }

    return placedCells;
  };

  // Try to place each word with increased attempts for better crossings
  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 200; // Increased attempts for better chance of finding crossings
    let placedCells: { id: string; x: number; y: number; letter: string; }[] = [];

    while (!placed && attempts < maxAttempts) {
      attempts++;

      // Select a random starting position
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);

      // Select a random direction
      const dirIndex = Math.floor(Math.random() * directions.length);
      const direction = directions[dirIndex];

      // Try to place the word
      if (canPlaceWord(word, startX, startY, direction.x, direction.y)) {
        placedCells = placeWord(word, startX, startY, direction.x, direction.y);
        placed = true;
      }
    }

    if (placed) {
      result.push(placedCells);
    } else {
      console.warn(`Could not place word: ${word}`);
    }
  }

  // // Fill remaining empty cells with random letters
  // for (const cell of workingGrid) {
  //   if (!cell.letter) {
  //     cell.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  //   }
  // }

  // --- MODIFIED FILLING LOGIC ---
  const fillerChars = (fillerLetters && fillerLetters.length > 0)
    ? [...new Set(fillerLetters.toUpperCase().split(''))] // Use provided letters, ensure no duplicates
    : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''); // Default to all letters
console.log('fillerLetters', fillerLetters)
  const emptyCells = workingGrid.filter(cell => !cell.letter);

  for (const cell of emptyCells) {
    const x = cell.x / 10;
    const y = cell.y / 10;

    // Try filler letters in a random order
    const shuffledFillers = [...fillerChars].sort(() => Math.random() - 0.5);
    let placedFiller = false;

    for (const filler of shuffledFillers) {
      if (isSafeToPlace(filler, x, y, size, words, getCellAt)) {
        cell.letter = filler;
        placedFiller = true;
        break; // Letter placed, move to the next empty cell
      }
    }

    if (!placedFiller) {
      // This case is rare, but could happen if all possible filler letters
      // would form a word. We'll place the first possible letter and warn.
      if (fillerChars.length > 0) {
        cell.letter = fillerChars[0];
        console.warn(`Could not find a 'safe' letter for cell (${x},${y}). Placing a default filler.`);
      }
    }
  }

  return result;
}

export default Words;


