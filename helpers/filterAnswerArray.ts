import { GridCellProps } from './generateGrid';

export const filterAnswerArray = (answerArray: GridCellProps[][]) => {
  const newAnswerArray = answerArray.filter((item) => item.length > 0);

  const removable: number[] = [];
  for (let j = 0; j < newAnswerArray.length; j++) {
    for (let i = 0; i < newAnswerArray.length; i++) {
      if (newAnswerArray[i][0].id === newAnswerArray[j][0].id && i < j) {
        const matchingLetters = newAnswerArray[i].map((item, index) => newAnswerArray[j]
          .filter((itemJ, indexJ) => item.id === itemJ.id && index === indexJ));
        if (newAnswerArray[i].length === matchingLetters.filter((item) => item.length > 0).length) {
          removable.push(j);
        }
      }
    }
  }

  const uniqAnswerArray = newAnswerArray.filter((_, index) => !removable.includes(index));
  return uniqAnswerArray.filter((item) => item !== undefined && item.length > 1 && item[0].letter !== undefined);
};

export default filterAnswerArray;
