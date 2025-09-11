import { GridCellProps } from './generateGrid';

const freeVerticalSpaceFilter = (unusedWords: string[], createGrid: GridCellProps[]) => {
  const minUnusedWordsLength = Math.min(...unusedWords.map((str) => str.length));
  const allFreeSpaces: GridCellProps[][] = [];
  let freeSpace: GridCellProps[] = [];

  const verticallySortedGrid = createGrid.sort((a, b) => ((a.x > b.x) ? 1 : ((b.x > a.x) ? -1 : 0)));

  verticallySortedGrid.map((item) => {
    if (item.letter !== '') {
      if (freeSpace.length > 0) { allFreeSpaces.push(freeSpace); }
      freeSpace = [];
    } else if (freeSpace.length > 0) {
      if (freeSpace[0].x !== item.x) {
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

export default freeVerticalSpaceFilter;
