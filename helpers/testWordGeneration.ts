import { v4 as uuidv4 } from 'uuid';

// Possible directions for word placement
const DIRECTIONS = [
    { dx: 1, dy: 0 },   // Horizontal (right)
    { dx: -1, dy: 0 },  // Horizontal (left)
    { dx: 0, dy: 1 },   // Vertical (down)
    { dx: 0, dy: -1 },  // Vertical (up)
    { dx: 1, dy: 1 },   // Diagonal (down-right)
    { dx: -1, dy: -1 }, // Diagonal (up-left)
    { dx: 1, dy: -1 },  // Diagonal (up-right)
    { dx: -1, dy: 1 }   // Diagonal (down-left)
];

export const generateWordSearchMaze = (grid: any, words: any[], size: number) => {
    // Validate inputs
    if (size < 5 || size > 25) {
        throw new Error('Grid size must be between 5 and 25');
    }

    // Create a 2D grid to track letter placement
    const gridMap = new Array(size).fill(null).map(() =>
        new Array(size).fill(null)
    );

    // Convert flat grid to 2D grid for easier manipulation
    const flatToGrid = (gridArray: any[]) => {
        const gridMap = new Array(size).fill(null).map(() =>
            new Array(size).fill(null)
        );
        gridArray.forEach(cell => {
            const x = Math.floor(cell.x / 10);
            const y = Math.floor(cell.y / 10);
            gridMap[y][x] = cell;
        });
        return gridMap;
    };

    const gridWithCells = flatToGrid(grid);

    // Try to place a word in the grid
    const placeWord = (word: string | any[]) => {
        const maxAttempts = 100;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            const startX = Math.floor(Math.random() * size);
            const startY = Math.floor(Math.random() * size);

            // Check if word fits in this direction
            if (canPlaceWord(word, startX, startY, direction)) {
                // Place the word
                for (let i = 0; i < word.length; i++) {
                    const x = startX + i * direction.dx;
                    const y = startY + i * direction.dy;
                    gridWithCells[y][x].letter = word[i].toUpperCase();
                }
                return true;
            }
        }
        return false;
    };

    // Check if a word can be placed at a specific position
    const canPlaceWord = (word: string | any[], startX: number, startY: number, direction: { dx: any; dy: any; }) => {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * direction.dx;
            const y = startY + i * direction.dy;

            // Check bounds
            if (x < 0 || x >= size || y < 0 || y >= size) {
                return false;
            }

            // Check if cell is empty or matches the current letter
            const cell = gridWithCells[y][x];
            if (cell.letter && cell.letter !== word[i].toUpperCase()) {
                return false;
            }
        }
        return true;
    };

    // Fill remaining empty cells with random letters
    const fillRemainingCells = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        gridWithCells.forEach(row => {
            row.forEach(cell => {
                if (!cell.letter) {
                    cell.letter = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            });
        });
    };

    // Place words
    const placedWords = words.filter(placeWord);

    // Fill remaining cells
    fillRemainingCells();

    // Flatten grid back to original format
    const result = gridWithCells.flatMap(row => row);

    return {
        grid: result,
        placedWords
    };
};

// Example usage
// const grid = generateGrid(10); // Assuming generateGrid function exists
// const words = ['HELLO', 'WORLD', 'MAZE'];
// const wordSearchResult = generateWordSearchMaze(grid, words, 10);
