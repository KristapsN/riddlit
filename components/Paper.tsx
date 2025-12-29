'use client'

import { Stage, Layer, Rect, Transformer } from "react-konva"
import { CrosswordTextProps, GridWithPropsProps, ImageDraggedProps, PageElementProps, TextsProps } from "../app/protected/page"
import React, { useEffect, useRef, useState, forwardRef } from "react"
import { WordMaze } from "./WorMaze"
import { ImageElement } from "./Image"
import { Button } from "@mui/material"
import TextComponent from "./TextComponent"
import { Crossword } from "./Crossword"

interface PaperProps {
  width: number
  height: number
  texts: TextsProps[]
  setTexts: any
  createGrid: GridWithPropsProps[][]
  setCreateGridWithProps: any
  showAnswers: boolean
  showAnswerList: boolean
  images: ImageDraggedProps[]
  setImages: any
  currentPage: string
  selectImage: any
  isImageSelected: boolean
  pages: PageElementProps[]
  setSelectedAccordion: React.Dispatch<React.SetStateAction<string>>
  setOpenedToolPage: React.Dispatch<React.SetStateAction<string>>
  setCrosswordText: React.Dispatch<React.SetStateAction<CrosswordTextProps[]>>
  crosswordText: CrosswordTextProps[]
  openCrosswordAnswerMarkers: boolean
}

const Paper = forwardRef((
  {
    createGrid,
    setCreateGridWithProps,
    width,
    height,
    texts,
    setTexts,
    showAnswers,
    showAnswerList,
    images,
    setImages,
    currentPage,
    selectImage,
    isImageSelected,
    pages,
    setSelectedAccordion,
    setOpenedToolPage,
    setCrosswordText,
    crosswordText,
    openCrosswordAnswerMarkers,
  }: PaperProps, ref) => {
  const [selectedId, selectShape] = useState<string | null>(null);
  const selectionRectRef = React.useRef('');
  const layerRef = useRef('');
  const trRef = useRef('');
  const stageRef = useRef(null);

  const history = useRef([]);
  const historyStep = useRef(0);
console.log('selectedId', selectedId)
  useEffect(() => {
    !isImageSelected && selectShape(null)
  }, [isImageSelected])

  const checkDeselect = (e: { target: { getStage: () => any } }) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
      selectImage(null)
    }
  };

  const handleRemove = (id: string) => {
    const newList = images.filter((item) => item.id !== id);
    setImages(newList);
  };

  const unSelectShape = (prop: React.SetStateAction<string | null>) => {

    selectShape(prop);
  };

  const onDeleteImage = (id: string) => {
    const newImages = images.filter((item) => `image${item.id}` !== selectedId);

    setImages(newImages);
    selectShape(null);
    selectImage(null)
  };

  const [stageSpec, setStageSpec] = useState({
    scale: 1,
    x: 0,
    y: 0
  });

  const handleUndo = () => {
    if (historyStep.current === 0) {
      return;
    }

    historyStep.current -= 1;
    const previous = history.current[historyStep.current];
    // @ts-ignore
    if (previous.element === 'text') {
      const newTexts = [...texts];
      // @ts-ignore
      const text = texts.find((text) => text.id === previous.id)
      if (text) {
        // @ts-ignore
        text.initialPosition.x = previous.x
        // @ts-ignore
        text.initialPosition.y = previous.y
      }
      setTexts(newTexts)
    }
    // @ts-ignore
    if (previous.element === 'image') {
      const newImages = [...images];
      // @ts-ignore
      const img = images.find((item) => item.id === previous.id)
      if (img) {
        // @ts-ignore
        img.x = previous.x
        // @ts-ignore
        img.y = previous.y
      }
      setImages(newImages);
    }
  };

  return (
    <>
      {/* <Button onClick={() => handleUndo()}>undo</Button> */}
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        // onClick={onClickTap}
        // onTap={onClickTap}
        scaleX={stageSpec.scale}
        scaleY={stageSpec.scale}
        x={stageSpec.x}
        y={stageSpec.y}
        style={{
          backgroundColor: 'white'
        }}
        onLoad={() => {
          // @ts-ignore
          if (onLoad) onLoad();
        }}
      >
        {/* @ts-ignore */}
        <Layer ref={layerRef} >
          {images?.filter((item) => item.pageNumber === currentPage)
            .map((image, index) => {
              return (
                <ImageElement
                  // @ts-ignore
                  image={image}
                  key={index}
                  // @ts-ignore
                  shapeProps={image}
                  // stageScale={stageSpec.scale}
                  isSelected={`image${image.id}` === selectedId}
                  unSelectShape={unSelectShape}
                  onClick={() =>
                    handleRemove(image.id)
                  }
                  onSelect={() => {
                    selectImage(image.id)
                    selectShape(`image${image.id}`);
                  }}
                  onChange={(newAttrs) => {
                    const newImages = [...images];
                    const img = images.find((item) => item.id === image.id)
                    if (img) {
                      img.x = newAttrs.x
                      img.y = newAttrs.y
                      img.w = newAttrs.w
                      img.h = newAttrs.h
                    }

                    setImages(newImages);
                  }}
                  onDragStart={(e) => {
                    // history.current = history.current.slice(0, historyStep.current + 1);
                    const pos = {
                      element: 'image',
                      id: image.id,
                      x: e.x,
                      y: e.y,
                    };
                    // @ts-ignore
                    history.current = history.current.concat([pos]);
                    historyStep.current += 1;
                  }}
                  onDelete={() => onDeleteImage(image.id)}
                />
              )
            })}
          {createGrid.filter((item) => item && item[0]?.pageNumber === currentPage).map((grid, index) => {
            const answerList = grid[0].answerList.map(
              (item: { letter: any }[]) => item.map(({ letter }) => letter).join('')
            )

            return (
              <WordMaze
                key={index}
                // initialSquareSize={initialSquareSize}
                createGridWithProps={grid[0]}
                createGrid={grid[0].grid}
                isSelected={`maze${grid[0].id}` === selectedId}
                isAnswersSelected={`answers${grid[0].id}` === selectedId}
                // @ts-ignore
                isAnswerSelected={'answer' === selectedId?.split('_')[0] && selectedId}
                rawAnswerArray={grid[0].answerList}
                showAnswers={showAnswers}
                showAnswerList={showAnswerList}
                answerList={answerList}
                onSelect={(id, isGrouped) => {
                  id === 'maze' && selectShape(`maze${grid[0].id}`);
                  (id === 'answers' && isGrouped) && selectShape(`answers${grid[0].id}`);
                  (id.split('_')[0] === 'answer' && !isGrouped) && selectShape(id);
                  setOpenedToolPage('maze')
                  setSelectedAccordion(grid[0].id)
                }}
                onChange={(newAttrs) => {
                  const newGrid = [...createGrid];
                  const grd = createGrid.find((item) => item[0]?.id === grid[0].id)
                  if (grd) {
                    grd[0].x = newAttrs.x
                    grd[0].y = newAttrs.y
                    grd[0].w = newAttrs.w
                    grd[0].h = newAttrs.h
                    grd[0].answerX = newAttrs.answerX
                    grd[0].answerY = newAttrs.answerY
                    grd[0].answerH = newAttrs.answerH
                    grd[0].answerW = newAttrs.answerW
                  }
                  setCreateGridWithProps(newGrid)

                }}
                // @ts-ignore
                gameGridSize={grid[0].gridSize}
                answerColumns={grid[0].answerColumns}
                answerColor={grid[0].answerColor}
                answerFont={grid[0].answerFont}
                mazeBorderSize={grid[0].mazeBorderSize}
                mazeBorderColor={grid[0].mazeBorderColor}
                mazeColor={grid[0].mazeColor}
                mazeFont={grid[0].mazeFont}
              />
            )
          })}

          {crosswordText.filter((item) => item && item?.pageNumber === currentPage).map((crossword, index) => {

            return (
              <Crossword
                key={index}
                // initialSquareSize={initialSquareSize}
                crosswordPuzzle={crossword}
                isSelected={`crossword${crossword.id}` === selectedId}
                // @ts-ignore
                onSelect={(id) => {
                  console.log('id', id)
                  id === 'crossword' && selectShape(`crossword${crossword.id}`);
                  setOpenedToolPage('crossword')
                  setSelectedAccordion(crossword.id)
                }}
                onChange={(newAttrs) => {
                  const newGrid = [...crosswordText];
                  const grd = crosswordText.find((item) => item?.id === crossword.id)
                  if (grd) {
                    crossword.x = newAttrs.x
                    crossword.y = newAttrs.y
                    crossword.w = newAttrs.w
                    crossword.h = newAttrs.h
                  }
                  setCreateGridWithProps(newGrid)

                }}
                // @ts-ignore
                mazeBorderSize={crossword.mazeBorderSize}
                mazeBorderColor={crossword.mazeBorderColor}
                mazeColor={crossword.mazeColor}
                mazeFont={crossword.mazeFont}
                openCrosswordAnswerMarkers={openCrosswordAnswerMarkers}
              />
            )
          })}
          {texts.filter((item) => item?.pageNumber === currentPage && item.value).map((item, index) => {
            return (
              <React.Fragment key={index}>
                <TextComponent
                  key={index}
                  text={item.value}
                  textProps={item}
                  x={item.initialPosition.x}
                  y={item.initialPosition.y}
                  fontSize={item.size}
                  fontFamily={item.font}
                  color={item.color}
                  width={item.width}
                  align={item.align}
                  isSelected={`text_${item.id}` === selectedId}
                  // unSelectShape={unSelectShape}
                  // onClick={() => handleRemove(image.id)}
                  onSelect={() => {
                    selectShape(`text_${item.id}`);
                    setSelectedAccordion(item.id)
                    setOpenedToolPage('texts')
                  }}
                  // @ts-ignore
                  onChange={(newAttrs) => {
                    const newTexts = [...texts];
                    const text = texts.find((text) => text.id === item.id)

                    if (text) {
                      text.initialPosition.x = newAttrs.x
                      text.initialPosition.y = newAttrs.y
                      text.width = newAttrs.width
                    }
                    setTexts(newTexts)
                  }}
                  // @ts-ignore
                  onDragStart={(e) => {
                    // history.current = history.current.slice(0, historyStep.current + 1);
                    const pos = {
                      element: 'text',
                      id: item.id,
                      x: e.x,
                      y: e.y,
                    };
                    // @ts-ignore
                    history.current = history.current.concat([pos]);
                    historyStep.current += 1;
                  }}
                />
              </React.Fragment >
            )
          })
          }
          <Transformer
            // ref={trRef.current[getKey]}
            // @ts-ignore
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          {/* @ts-ignore */}
          <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
        </Layer>
      </Stage>
    </>
  );
})

export default Paper;
