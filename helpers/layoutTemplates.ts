import { v4 as uuids4 } from 'uuid';

export const firstTemplate = (pdfPreviewHeight: number, pdfSize: number[]) => {
  const pdfWidth = pdfPreviewHeight * (pdfSize[0] / pdfSize[1]) / 3
  return({
  wordMazeArray: [
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: pdfWidth / 2,
      y: pdfPreviewHeight * 0.25,
      w: pdfWidth * 2,
      h: pdfWidth * 2,
      answerX: pdfWidth / 2,
      answerY: pdfPreviewHeight * 0.25 + pdfWidth * 2 + 30,
      answerW: pdfWidth * 2,
      answerColumns: 3,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    }
  ]
  ,
  text: [
    {
      id: uuids4(),
      value: 'The Placeholder Puzzle',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.1 },
      font: 'Roboto',
      size: 32,
      color: '#000000',
      align: 'center',
    },
    {
      id: uuids4(),
      value: 'Uncover the hidden words related to temporary spaces and future content in this intriguing puzzle.',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.15 },
      font: 'Roboto',
      size: 18,
      color: '#000000',
      align: 'center',
    }
  ],
})}

export const secondTemplate = (pdfPreviewHeight: number, pdfSize: number[]) => {
  const pdfWidth = pdfPreviewHeight * (pdfSize[0] / pdfSize[1]) / 3
  return({
  wordMazeArray: [
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: pdfWidth / 1.5,
      y: pdfPreviewHeight * 0.25,
      w: pdfWidth * 2,
      h: pdfWidth * 2,
      answerX: pdfWidth/ 4,
      answerY: pdfPreviewHeight * 0.25,
      answerW: pdfWidth / 2,
      answerColumns: 1,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    }
  ]
  ,
  text: [
    {
      id: uuids4(),
      value: 'The Placeholder Puzzle',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.1 },
      font: 'Roboto',
      size: 32,
      color: '#000000',
      align: 'center',
    },
    {
      id: uuids4(),
      value: 'Uncover the hidden words related to temporary spaces and future content in this intriguing puzzle.',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.15 },
      font: 'Roboto',
      size: 18,
      color: '#000000',
      align: 'center',
    }
  ],
})}

export const thirdTemplate = (pdfPreviewHeight: number, pdfSize: number[]) => {
  const pdfWidth = pdfPreviewHeight * (pdfSize[0] / pdfSize[1]) / 3
  return({
  wordMazeArray: [
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: pdfWidth / 3,
      y: pdfPreviewHeight * 0.20,
      w: pdfWidth,
      h: pdfWidth,
      answerX: pdfWidth / 3,
      answerY: pdfPreviewHeight * 0.20 + pdfWidth + 30,
      answerW: pdfWidth,
      answerColumns: 3,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    },
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: (pdfWidth / 3) * 2 + pdfWidth,
      y: pdfPreviewHeight * 0.20,
      w: pdfWidth,
      h: pdfWidth,
      answerX: (pdfWidth / 3) * 2  + pdfWidth,
      answerY: pdfPreviewHeight * 0.20 + pdfWidth + 30,
      answerW: pdfWidth,
      answerColumns: 3,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    },
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: pdfWidth / 3,
      y: pdfPreviewHeight * 0.20 + pdfWidth + 100,
      w: pdfWidth,
      h: pdfWidth,
      answerX: pdfWidth / 3,
      answerY: pdfPreviewHeight * 0.20 + pdfWidth + 100 + pdfWidth + 30,
      answerW: pdfWidth,
      answerColumns: 3,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    },
    {
      id: uuids4(),
      answerArray: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'],
      gridSize: 10,
      x: (pdfWidth / 3) * 2 + pdfWidth,
      y: pdfPreviewHeight * 0.20 + pdfWidth + 100,
      w: pdfWidth,
      h: pdfWidth,
      answerX: (pdfWidth / 3) * 2  + pdfWidth,
      answerY: pdfPreviewHeight * 0.20 + pdfWidth + 100 + pdfWidth + 30,
      answerW: pdfWidth,
      answerColumns: 3,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
    }
  ]
  ,
  text: [
    {
      id: uuids4(),
      value: 'The Placeholder Puzzle',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.05 },
      font: 'Roboto',
      size: 32,
      color: '#000000',
      align: 'center',
    },
    {
      id: uuids4(),
      value: 'Uncover the hidden words related to temporary spaces and future content in this intriguing puzzle.',
      width: pdfWidth * 2,
      initialPosition: { x: pdfWidth / 2, y: pdfPreviewHeight * 0.10 },
      font: 'Roboto',
      size: 18,
      color: '#000000',
      align: 'center',
    }
  ],
})}
