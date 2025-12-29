import { GridCellProps, generateGrid } from "@/helpers/generateGrid"
import { Fragment, useEffect, useRef, useState } from "react"
import { Group, Shape, Transformer } from "react-konva"
import { GridWithPropsProps } from "../app/protected/page"
import { getColumnIndices } from "@/helpers/getColumnIndices"

interface WordMazeProps {
  // initialSquareSize: React.MutableRefObject<number>
  createGrid: GridCellProps[]
  createGridWithProps: GridWithPropsProps
  isSelected: boolean | null
  isAnswersSelected: boolean | null
  isAnswerSelected: string | null
  onChange: (attribute: GridWithPropsProps) => void
  onSelect: (id: string, isGrouped?: boolean) => void
  rawAnswerArray: GridCellProps[][]
  showAnswers: boolean
  gameGridSize: number
  answerList: string[]
  showAnswerList: boolean;
  answerColumns: number;
  answerColor: string;
  answerFont: string;
  mazeBorderSize: number;
  mazeBorderColor: string;
  mazeColor: string;
  mazeFont: string;
}

export const WordMaze = ({
  createGrid,
  createGridWithProps,
  gameGridSize,
  isSelected,
  isAnswersSelected,
  isAnswerSelected,
  onChange,
  onSelect,
  rawAnswerArray,
  showAnswers,
  answerList,
  showAnswerList,
  answerColumns,
  answerColor,
  answerFont,
  mazeBorderSize,
  mazeBorderColor,
  mazeColor,
  mazeFont
}: WordMazeProps) => {
  const squareSize = useRef<number>(0)
  const shapeRef = useRef('');
  const trRef = useRef('');
  const answersRef = useRef('');
  const answerRef = useRef('');
  const answersShapeRef = useRef('');
  const answerShapeRef = useRef({});

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      // @ts-ignore
      trRef.current.nodes([shapeRef.current]);
      // @ts-ignore
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (isAnswersSelected) {
      // @ts-ignore
      answersRef.current.nodes([answersShapeRef.current]);
      // @ts-ignore
      answersRef.current.getLayer().batchDraw();
    }
  }, [isAnswersSelected]);

  useEffect(() => {
    if (isAnswerSelected) {
      // @ts-ignore
      answerShapeRef.current && answerRef.current.nodes([answerShapeRef.current[isAnswerSelected]]);
      // @ts-ignore
      answerRef.current.getLayer().batchDraw();
    }
  }, [isAnswerSelected]);

  return (
    <Fragment>
      {/* {createdGridAll.current.map((createdGrid, index) => { */}
      {/* return ( */}
      <Fragment>
        <Shape
          width={createGridWithProps.w}
          height={createGridWithProps.h}
          x={createGridWithProps.x}
          y={createGridWithProps.y}
          onClick={() => onSelect('maze')}
          // @ts-ignore
          onTap={onSelect}
          // @ts-ignore
          ref={shapeRef}
          // onSelect={() => { }}
          draggable
          onMouseDown={() =>onSelect('maze')}
          onDragEnd={(e) => {
            // @ts-ignore
            shapeRef.current.attrs.x = e.target.x()
            // @ts-ignore
            shapeRef.current.attrs.y = e.target.y()
            onChange({
              ...createGridWithProps,
              x: e.target.x(),
              y: e.target.y(),
            })
          }}
          sceneFunc={function (ctx, shape) {
            // @ts-ignore
            const currentSquareWidth = createGridWithProps.w / createGridWithProps.gridSize
            // @ts-ignore
            const currentSquareHeight = createGridWithProps.h / createGridWithProps.gridSize
            createGridWithProps.grid.map(({ x, y, letter }) => {
              const startCoordinatesX = (x / 10) * currentSquareWidth
              const startCoordinatesY = (y / 10) * currentSquareWidth
              ctx.lineWidth = mazeBorderSize;
              ctx.strokeStyle = mazeBorderColor;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.rect(startCoordinatesX, startCoordinatesY, currentSquareWidth, currentSquareHeight)
              ctx.stroke()

              ctx.fillStyle = mazeColor;
              ctx.font = `${currentSquareWidth * 0.60}px ${mazeFont}`;
              const text = ctx.measureText(letter)

              ctx.fillText(letter,
                startCoordinatesX + currentSquareWidth / 2 - text.width / 2,
                startCoordinatesY + currentSquareHeight / 2 + (currentSquareHeight / 5)
              )
              ctx.fillStrokeShape(shape);
            })
            const answerMarkerSpacing = currentSquareWidth / 10
            const referenceSquareDiagonalSizes = Math.sqrt(2 * Math.pow(currentSquareWidth, 2))


            showAnswers && rawAnswerArray.map((rawAnswers) => {
              // const rawAnswers = item[0]
              const startCoordinatesX = 0
              const startCoordinatesY = rawAnswers[0].y / 10 * currentSquareWidth + 0
              const answerLength = (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10
              const answerHeight = (rawAnswers[rawAnswers.length - 1].y - rawAnswers[0].y + 10) / 10
              ctx.lineWidth = 2
              ctx.strokeStyle = 'black';
              // console.log('answerMarkerSpacing', answerMarkerSpacing, 'startCoordinatesY', startCoordinatesY, 'answerLength', answerLength, 'answerHeight', answerHeight)
              ctx.beginPath();
              ctx.moveTo(0, 0);

              if (answerLength === rawAnswers.length && answerHeight === 1) {
                ctx.roundRect(
                  startCoordinatesX + (rawAnswers[0].x / 10) * currentSquareWidth + answerMarkerSpacing,
                  startCoordinatesY + answerMarkerSpacing,
                  (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * currentSquareWidth - answerMarkerSpacing * 2,
                  currentSquareWidth - answerMarkerSpacing * 2,
                  [40]
                )
                ctx.stroke()
              }

              if (answerLength === 1 && answerHeight === rawAnswers.length) {
                ctx.roundRect(
                  startCoordinatesX + (rawAnswers[0].x / 10) * currentSquareWidth + answerMarkerSpacing,
                  startCoordinatesY + answerMarkerSpacing,
                  currentSquareWidth - answerMarkerSpacing * 2,
                  (rawAnswers[rawAnswers.length - 1].y - rawAnswers[0].y + 10) / 10 * currentSquareWidth - answerMarkerSpacing * 2,
                  [40]
                )
                ctx.stroke()
              }
              if (answerLength !== 1 && answerHeight !== 1 && rawAnswers[0].y < rawAnswers[rawAnswers.length - 1].y) {
                const rotationPositionX = (startCoordinatesX + (rawAnswers[0].x / 10) * currentSquareWidth) + currentSquareWidth / 2
                ctx.translate(
                  rotationPositionX,
                  startCoordinatesY,
                )
                ctx.rotate((45 * Math.PI) / 180)
                ctx.roundRect(
                  0,
                  0,
                  (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * referenceSquareDiagonalSizes - (currentSquareWidth / 2 + answerMarkerSpacing),
                  currentSquareWidth - answerMarkerSpacing * 2,
                  [40]
                )
                ctx.rotate((-45 * Math.PI) / 180)
                ctx.translate(
                  rotationPositionX * -1,
                  startCoordinatesY * -1,
                )
                ctx.stroke()
              }

              if (answerLength !== 1 && answerHeight !== 1 && rawAnswers[0].y > rawAnswers[rawAnswers.length - 1].y) {
                const rotationPositionX = (startCoordinatesX + (rawAnswers[0].x / 10) * currentSquareWidth);
                const rotationPositionY = startCoordinatesY + currentSquareWidth / 2
                ctx.translate(
                  rotationPositionX,
                  rotationPositionY,
                )
                ctx.rotate((-45 * Math.PI) / 180)
                ctx.roundRect(
                  0,
                  0,
                  (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * referenceSquareDiagonalSizes - (currentSquareWidth / 2 + answerMarkerSpacing),
                  currentSquareWidth - answerMarkerSpacing * 2,
                  [40]
                )
                ctx.rotate((45 * Math.PI) / 180)
                ctx.translate(
                  rotationPositionX * -1,
                  rotationPositionY * -1,
                )
                ctx.stroke()
              }
              // ctx.stroke()
              ctx.fillStrokeShape(shape);
            })

          }}
          // fill="#00D2FF"
          // stroke="black"
          // strokeWidth={1}
          onTransformEnd={(e) => {
            const node = shapeRef.current;
            // @ts-ignore
            const scaleX = node.scaleX();
            // @ts-ignore
            const scaleY = node.scaleY();
            onChange({
              ...createGridWithProps,
              // @ts-ignore
              x: node.x(),
              // @ts-ignore
              y: node.y(),
              // @ts-ignore
              w: Math.max(5, node.width() * scaleX),
              // @ts-ignore
              h: Math.max(5, node.height() * scaleY),
            });
            // @ts-ignore
            node.scaleX(1);
            // @ts-ignore
            node.scaleY(1);
          }}
        />
        {showAnswerList &&
          <Shape
            draggable={true}
            x={createGridWithProps.answerX}
            y={createGridWithProps.answerY}
            width={createGridWithProps.answerW}
            height={createGridWithProps.answerH}
            // @ts-ignore
            ref={answersShapeRef}
            onClick={() => onSelect('answers', true)}
            onMouseDown={() => onSelect('answers', true)}
            onDragEnd={(e) => {
              onChange({
                ...createGridWithProps,
                answerX: e.target.x(),
                answerY: e.target.y(),
              })
            }}
            onTransform={() => {
              const node = answersShapeRef.current;
              // @ts-ignore
              const scaleX = node.scaleX();
              // @ts-ignore
              const scaleY = node.scaleY();
              onChange({
                ...createGridWithProps,
                // @ts-ignore
                answerX: node.x(),
                // @ts-ignore
                answerY: node.y(),
                // @ts-ignore
                answerW: Math.max(5, node.width() * scaleX),
                // @ts-ignore
                answerH: Math.max(5, node.height() * scaleY),
              });
              // @ts-ignore
              node.scaleX(1);
              // @ts-ignore
              node.scaleY(1);
            }}
            sceneFunc={function (ctx, shape) {
              const breakpoints = getColumnIndices(answerList, answerColumns)
              let xPosition = 0
              let yPosition = -1
              let currentBreakpoint = 1

              answerList.map((answer, index) => {
                yPosition += 1
                if(breakpoints[currentBreakpoint] === index) {
                  yPosition = 0
                  xPosition += createGridWithProps.answerW / answerColumns
                  currentBreakpoint += 1
                  if (breakpoints.length === currentBreakpoint) {
                    currentBreakpoint -= 1
                  }
                }

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.rect(
                  0 + xPosition,
                  0 + (yPosition) * createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length,
                  createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length - 10,
                  createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length - 10
                )
                ctx.strokeStyle = answerColor;
                ctx.fillStyle = answerColor;
                const fontSize = createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length - 10
                ctx.font = `${fontSize}px ${answerFont}`;
                ctx.fillText(answer,
                  0 + createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length + xPosition,
                  0 + (yPosition) * createGridWithProps.answerH * createGridWithProps.answerColumns / answerList.length + (fontSize * 0.8),
                )
                ctx.strokeStyle = answerColor; // First stroke color
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath(); // Start a new path for the next stroke
                ctx.moveTo(100, 0);
                ctx.rect(
                  0,
                  0,
                  createGridWithProps.answerW,
                  createGridWithProps.answerH
                )
                ctx.strokeStyle = 'transparent'; // Second stroke color
                ctx.lineWidth = 0;
                ctx.stroke();

                ctx.fillStrokeShape(shape);
              })
            }}
          />}
        {isSelected && (
          <Transformer
            // @ts-ignore
            ref={trRef}
            rotateEnabled={false}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
        {isAnswersSelected && (
          <Transformer
            // @ts-ignore
            ref={answersRef}
            rotateEnabled={false}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
        {isAnswerSelected && (
          <Transformer
            // @ts-ignore
            ref={answerRef}
            rotateEnabled={false}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </Fragment>
    </Fragment>
  )
}
