import { GridCellProps } from './generateGrid';

const fillInHorizontalAnswer = (
  unusedWords: string[],
  answers: GridCellProps[][],
  filteredAllFreeSpaces: GridCellProps[][],
) => {
  for (let i = 0; i < unusedWords.length; i++) {
    const wordSpaceOptions = filteredAllFreeSpaces.filter((spaces) => spaces.length >= unusedWords[i].length);

    if (wordSpaceOptions.length === 1) {
      wordSpaceOptions[0].forEach((space, index) => space.letter = unusedWords[i][index]);

      if (unusedWords[i].length < wordSpaceOptions[0].length) {
        answers.push(wordSpaceOptions[0].splice(0, unusedWords[i].length));
      } else {
        answers.push(wordSpaceOptions[0]);
      }
    } else if (wordSpaceOptions.length > 1) {
      const randomSpaceNumber = Math.floor(Math.random() * wordSpaceOptions.length);
      wordSpaceOptions[randomSpaceNumber].forEach((space, index) => space.letter = unusedWords[i][index]);
      if (unusedWords[i].length < wordSpaceOptions[randomSpaceNumber].length) {
        answers.push(wordSpaceOptions[randomSpaceNumber].splice(0, unusedWords[i].length));
      } else {
        answers.push(wordSpaceOptions[randomSpaceNumber]);
      }

      wordSpaceOptions.splice(randomSpaceNumber, 1);
    }
  }
  return answers;
};

export default fillInHorizontalAnswer;
