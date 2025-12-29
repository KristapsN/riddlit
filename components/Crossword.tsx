import { GridCellProps, generateGrid } from "@/helpers/generateGrid"
import { Fragment, useEffect, useRef, useState } from "react"
import { Group, Shape, Transformer } from "react-konva"
import { CrosswordTextProps, GridWithPropsProps } from "../app/protected/page"
import { getColumnIndices } from "@/helpers/getColumnIndices"

interface CrosswordProps {
  // initialSquareSize: React.MutableRefObject<number>
  crosswordPuzzle: CrosswordTextProps
  isSelected: boolean | null
  onChange: (attribute: CrosswordTextProps) => void
  onSelect: (id: string, isGrouped?: boolean) => void
  mazeBorderSize: number;
  mazeBorderColor: string;
  mazeColor: string;
  mazeFont: string;
  openCrosswordAnswerMarkers: boolean;
}
// @ts-ignore
function findMaxCoordinates(arr) {
  // @ts-ignore
  return arr.reduce((max, obj) => ({
    x: Math.max(max.x, obj.x),
    y: Math.max(max.y, obj.y)
  }), { x: -Infinity, y: -Infinity });
}

export const Crossword = ({
  crosswordPuzzle,
  isSelected,
  onChange,
  onSelect,
  mazeBorderSize,
  mazeBorderColor,
  mazeColor,
  mazeFont,
  openCrosswordAnswerMarkers,
}: CrosswordProps) => {
  const shapeRef = useRef('');
  const trRef = useRef('');

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      // @ts-ignore
      trRef.current.nodes([shapeRef.current]);
      // @ts-ignore
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);



  return (
    <Fragment>
      {/* {createdGridAll.current.map((createdGrid, index) => { */}
      {/* return ( */}
      <Fragment>
        <Shape
          width={crosswordPuzzle.w}
          height={crosswordPuzzle.h}
          x={crosswordPuzzle.x}
          y={crosswordPuzzle.y}
          onClick={() => onSelect('crossword')}
          // @ts-ignore
          onTap={onSelect}
          // @ts-ignore
          ref={shapeRef}
          // onSelect={() => { }}
          draggable
          onMouseDown={() => onSelect('crossword')}
          onDragEnd={(e) => {
            // @ts-ignore
            shapeRef.current.attrs.x = e.target.x()
            // @ts-ignore
            shapeRef.current.attrs.y = e.target.y()
            onChange({
              ...crosswordPuzzle,
              x: e.target.x(),
              y: e.target.y(),
            })
          }}
          sceneFunc={function (ctx, shape) {

            const maxXYSize = findMaxCoordinates(crosswordPuzzle.grid)
            const maxSize = maxXYSize.x > maxXYSize.y ? maxXYSize.x + 1 : maxXYSize.y + 1
            console.log('maxSize', maxSize)
            // @ts-ignore
            const currentSquareWidth = crosswordPuzzle.w / maxSize
            // crosswordPuzzle.gridSize
            // @ts-ignore
            const currentSquareHeight = crosswordPuzzle.h / maxSize
            // crosswordPuzzle.gridSize

            crosswordPuzzle.grid.map(({ x, y, letter, horizontalNumber, verticalNumber }) => {
              const startCoordinatesX = (x) * currentSquareWidth
              const startCoordinatesY = (y) * currentSquareWidth
              ctx.lineWidth = mazeBorderSize;
              ctx.strokeStyle = mazeBorderColor;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.rect(startCoordinatesX, startCoordinatesY, currentSquareWidth, currentSquareHeight)
              ctx.stroke()

              ctx.font = `${currentSquareWidth * 0.40}px ${mazeFont}`;

              horizontalNumber && ctx.fillText(horizontalNumber.toString(), startCoordinatesX + 2, startCoordinatesY + currentSquareWidth * 0.40)
              verticalNumber && ctx.fillText(verticalNumber.toString(), startCoordinatesX + 2, startCoordinatesY + currentSquareWidth * 0.40)

              ctx.fillStyle = mazeColor;
              ctx.font = `${currentSquareWidth * 0.60}px ${mazeFont}`;
              const text = ctx.measureText(letter)

              openCrosswordAnswerMarkers && ctx.fillText(letter,
                startCoordinatesX + currentSquareWidth / 2 - text.width / 2,
                startCoordinatesY + currentSquareHeight / 2 + (currentSquareHeight / 5)
              )
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
              ...crosswordPuzzle,
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
      </Fragment>
    </Fragment>
  )
}
