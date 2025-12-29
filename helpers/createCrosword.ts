// @ts-ignore
export function generateCrossword(words) {
  if (!words || words.length === 0) return [];

  // Shuffle words for randomization on each call
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  const grid = new Map();
  // @ts-ignore
  const placed = [];

  // Helper to set cell
  // @ts-ignore
  const setCell = (x, y, letter) => {
    const key = `${x},${y}`;
    grid.set(key, letter.toLowerCase());
  };

  // Helper to get cell
  // @ts-ignore
  const getCell = (x, y) => {
    return grid.get(`${x},${y}`) || null;
  };

  // Check if word can be placed horizontally
  // @ts-ignore
  const canPlaceH = (word, x, y) => {
    for (let i = 0; i < word.length; i++) {
      const cell = getCell(x + i, y);
      if (cell && cell !== word[i].toLowerCase()) return false;
      // Check perpendicular cells
      if (!cell) {
        if (getCell(x + i, y - 1) || getCell(x + i, y + 1)) return false;
      }
    }
    // Check ends
    if (getCell(x - 1, y) || getCell(x + word.length, y)) return false;
    return true;
  };

  // Check if word can be placed vertically
  // @ts-ignore
  const canPlaceV = (word, x, y) => {
    for (let i = 0; i < word.length; i++) {
      const cell = getCell(x, y + i);
      if (cell && cell !== word[i].toLowerCase()) return false;
      // Check perpendicular cells
      if (!cell) {
        if (getCell(x - 1, y + i) || getCell(x + 1, y + i)) return false;
      }
    }
    // Check ends
    if (getCell(x, y - 1) || getCell(x, y + word.length)) return false;
    return true;
  };

  // Place word horizontally
  // @ts-ignore
  const placeH = (word, x, y) => {
    for (let i = 0; i < word.length; i++) {
      setCell(x + i, y, word[i]);
    }
    placed.push({ word, x, y, dir: 'h' });
  };

  // Place word vertically
  // @ts-ignore
  const placeV = (word, x, y) => {
    for (let i = 0; i < word.length; i++) {
      setCell(x, y + i, word[i]);
    }
    placed.push({ word, x, y, dir: 'v' });
  };

  // Find intersection points
  // @ts-ignore
  const findIntersections = (word) => {
    // @ts-ignore
    const positions = [];
    // @ts-ignore
    placed.forEach(p => {
      for (let i = 0; i < word.length; i++) {
        for (let j = 0; j < p.word.length; j++) {
          if (word[i].toLowerCase() === p.word[j].toLowerCase()) {
            if (p.dir === 'h') {
              positions.push({ x: p.x + j, y: p.y - i, dir: 'v' });
            } else {
              positions.push({ x: p.x - i, y: p.y + j, dir: 'h' });
            }
          }
        }
      }
    });
    // @ts-ignore
    return positions;
  };

  // Place first word
  if (shuffled.length > 0) {
    placeH(shuffled[0], 0, 0);
  }

  // Place remaining words
  for (let i = 1; i < shuffled.length; i++) {
    const word = shuffled[i];
    const intersections = findIntersections(word);

    // Shuffle intersections for variety
    intersections.sort(() => Math.random() - 0.5);

    let placed_word = false;
    for (const pos of intersections) {
      if (pos.dir === 'h' && canPlaceH(word, pos.x, pos.y)) {
        placeH(word, pos.x, pos.y);
        placed_word = true;
        break;
      } else if (pos.dir === 'v' && canPlaceV(word, pos.x, pos.y)) {
        placeV(word, pos.x, pos.y);
        placed_word = true;
        break;
      }
    }

    // If no intersection found, try random placement near existing words
    if (!placed_word && placed.length > 0) {
      const attempts = 50;
      for (let attempt = 0; attempt < attempts; attempt++) {
        // @ts-ignore
        const refWord = placed[Math.floor(Math.random() * placed.length)];
        const offsetX = Math.floor(Math.random() * 10) - 5;
        const offsetY = Math.floor(Math.random() * 10) - 5;
        const dir = Math.random() < 0.5 ? 'h' : 'v';

        if (dir === 'h' && canPlaceH(word, refWord.x + offsetX, refWord.y + offsetY)) {
          placeH(word, refWord.x + offsetX, refWord.y + offsetY);
          break;
        } else if (dir === 'v' && canPlaceV(word, refWord.x + offsetX, refWord.y + offsetY)) {
          placeV(word, refWord.x + offsetX, refWord.y + offsetY);
          break;
        }
      }
    }
  }

  // Assign numbers to word starts (first letters)
  let minX = Infinity, minY = Infinity;
  // @ts-ignore
  placed.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  });

  // Shift placed words coordinates
  // @ts-ignore
  placed.forEach(p => {
    p.x -= minX;
    p.y -= minY;
  });

  // Sort placed words by position (top to bottom, left to right)
  // @ts-ignore
  placed.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  // Separate horizontal and vertical words and assign numbers
  const horizontalNumbers = new Map(); // key: "x,y", value: number
  const verticalNumbers = new Map(); // key: "x,y", value: number

  let hNum = 1;
  let vNum = 1;
  // @ts-ignore
  placed.forEach(p => {
    const key = `${p.x},${p.y}`;
    if (p.dir === 'h') {
      if (!horizontalNumbers.has(key)) {
        horizontalNumbers.set(key, hNum++);
      }
    } else {
      if (!verticalNumbers.has(key)) {
        verticalNumbers.set(key, vNum++);
      }
    }
  });

  // Convert grid to array of objects and normalize to positive coordinates
  // @ts-ignore
  const result = [];

  grid.forEach((letter, key) => {
    const [x, y] = key.split(',').map(Number);
    const normalizedX = x - minX;
    const normalizedY = y - minY;
    const normalizedKey = `${normalizedX},${normalizedY}`;

    const cell = {
      x: normalizedX,
      y: normalizedY,
      letter
    };

    // Check if this is a word start
    if (horizontalNumbers.has(normalizedKey)) {
      // @ts-ignore
      cell.horizontalNumber = horizontalNumbers.get(normalizedKey);
    }
    if (verticalNumbers.has(normalizedKey)) {
      // @ts-ignore
      cell.verticalNumber = verticalNumbers.get(normalizedKey);
    }

    result.push(cell);
  });
  // @ts-ignore
  return result;
}