import { GridCellProps } from './generateGrid';

const freeSpaceFilter = (unusedWords: string[], createGrid: GridCellProps[]) => {
  const minUnusedWordsLength = Math.min(...unusedWords.map((str) => str.length));
  const allFreeSpaces: GridCellProps[][] = [];
  let freeSpace: GridCellProps[] = [];

  createGrid.map((item) => {
    if (item.letter !== '') {
      if (freeSpace.length > 0) { allFreeSpaces.push(freeSpace); }
      freeSpace = [];
    } else if (freeSpace.length > 0) {
      if (freeSpace[0].y !== item.y) {
        allFreeSpaces.push(freeSpace);
        freeSpace = [];
      } else { freeSpace.push(item); }
    } else {
      freeSpace.push(item);
    }
  });

  const filteredAllFreeSpaces = allFreeSpaces.filter((spaces) => spaces.length >= minUnusedWordsLength);

  return filteredAllFreeSpaces;
};

export default freeSpaceFilter;
