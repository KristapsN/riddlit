'use client';
import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Switch from '@mui/material/Switch'
import AddIcon from '@mui/icons-material/Add'
import UploadIcon from '@mui/icons-material/Upload'
import Words from '@/helpers/generateWords'
import { GridCellProps, generateGrid } from '@/helpers/generateGrid'
import freeVerticalSpaceFilter from '@/helpers/freeVerticalSpaceFilter'
import fillInHorizontalAnswer from '@/helpers/freeHorizontalSpaceFilter'
import freeSpaceFilter from '@/helpers/freeCpaceFilter'
import filterAnswerArray from '@/helpers/filterAnswerArray'
import { randomLetterGenerator } from '@/helpers/randomLetterGenerator'
import { useWindowSize } from '@/hooks/windowSize'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Chip, CssBaseline, Divider, Drawer, FormLabel, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Modal, Pagination, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { getImageDimensions } from '@/helpers/imageDimentions'
import DescriptionIcon from '@mui/icons-material/Description';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import GridViewIcon from '@mui/icons-material/GridView';
import { v4 as uuids4 } from 'uuid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SwitchWithLabel } from "@/components/Switch";
import { ColorPicker } from "@/components/ColorPicker";
import { NumberInput } from "@/components/NumberInput";
import Textarea from '@mui/joy/Textarea';
import { handleExport } from "@/helpers/generatePdf";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Logo } from "@/helpers/logo";
import { geminiAiCall } from "@/helpers/geminiAiCall";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { firstTemplate, secondTemplate, thirdTemplate } from "@/helpers/layoutTemplates";


const Paper = dynamic(() => import('../../components/Paper'), {
  ssr: false,
});

export interface TextsProps {
  id: string
  width: number
  value: string
  initialPosition: Point
  size: number
  font: string
  pageNumber: string
  color: string
  align: 'left' | 'center' | 'right'
}

export interface MazeTextsProps {
  id: string
  value: string[]
  pageNumber: string
  answerColumns: number
  answerFont: string
  answerColor: string
  mazeBorderSize: number
  mazeBorderColor: string
  mazeFont: string
  mazeColor: string
}

type pdfSizesListProps = {
  name: string,
  size: [number, number]
}

export interface ImageDraggedProps {
  id: string
  x: number
  y: number
  src: string | undefined
  pageNumber: string
  w: number
  h: number
}

export interface GridWithPropsProps {
  id: string
  grid: GridCellProps[]
  answerList: GridCellProps[][]
  pageNumber: string
  gridSize?: number
  x: number
  y: number
  w: number
  h: number
  answerX: number
  answerY: number
  answerW: number
  answerH: number
  answerColumns: number
  answerFont: string
  answerColor: string
  mazeBorderSize: number
  mazeBorderColor: string
  mazeFont: string
  mazeColor: string
}

export interface ImagesProps {
  imageList: ImageListType
  addUpdateIndex: number[] | undefined
}

export interface PageElementProps {
  pageNumber: string
  createGrid?: GridWithPropsProps[][]
  texts?: TextsProps
  initialSquareSize?: number
  showAnswers?: boolean
  images?: ImagesProps
}

interface gridSizeProps {
  id: string
  gridSize: number
  pageNumber: string
}

export default function Maze() {

  const [gameGridSize, setGamGridSize] = useState<gridSizeProps[]>([{
    id: '1',
    gridSize: 10,
    pageNumber: '1'
  }])
  const [createGrid, setCreateGrid] = useState<GridCellProps[][]>([])
  const [createGridWithProps, setCreateGridWithProps] = useState<GridWithPropsProps[][]>([])
  const [pdfSize, setPdfSize] = useState([595.28, 841.89])
  // [210, 297])
  // [595.28, 841.89])
  const [textAreaText, setTextAreaText] = useState<MazeTextsProps[]>([
    // {
    //   id: '1',
    //   value: [],
    //   pageNumber: '1',
    //   answerColumns: 1,
    //   answerFont: 'Roboto',
    //   answerColor: '#000000',
    //   mazeBorderSize: 2,
    //   mazeBorderColor: 'black',
    //   mazeFont: 'Roboto',
    //   mazeColor: '#000000'

    // },
  ])
  const [openAnswerMarkers, setOpenAnswerMarkers] = useState(false)
  // @ts-ignore
  const pdfPreviewHeight = useWindowSize().height * 0.9 ?? 0
  const pdfPreviewWidth = pdfPreviewHeight * (pdfSize[0] / pdfSize[1]) * 2

  const squareSize = useRef<number>(0)
  // const wordMazeCornerP1a = useRef<Point>({ x: 0, y: 0 })
  const initialWordMazeGeneration = useRef<boolean>(true)
  const imageUploadIndexes = useRef<number[]>([])
  const [fonts, setFonts] = useState<string[]>([])
  // const [deleteImage, setDeleteImage] = useState<number>()
  const dragUrl = useRef('');
  const stageRef = useRef('');
  const [showOnHover, setShowOnHover] = useState<boolean | number>(false);
  const [currentPage, setCurrentPage] = useState('1')
  const [texts, setTexts] = useState<TextsProps[]>([
    // {
    //   id: '1',
    //   width: 100,
    //   value: '',
    //   initialPosition: { x: 0, y: 0 },
    //   size: 32,
    //   font: 'Roboto',
    //   pageNumber: '1',
    //   color: '#000000',
    //   align: 'left'
    // }
  ])
  const [showAnswerList, setShowAnswerList] = useState(true)
  const [images, setImages] = useState<ImagesProps>();
  const [imagesDragged, setImagesDragged] = useState<ImageDraggedProps[]>([]);
  const [pages, setPages] = useState<PageElementProps[]>([{
    pageNumber: '1'
  }])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [openBulkPageModal, setOpenBulkPageModal] = useState(false)
  const [amountOfPages, setAmountOfPages] = useState(1)
  // @typescript-eslint/no-unused-vars
  const [_, setMazeProps] = useState<MazeTextsProps[]>()
  const [puzzleDescriptionForAi, setPuzzleDescriptionForAi] = useState<string>('');
  const [loadAiCall, setLoadAiCall] = useState<boolean>(false);
  const [missingWordErrors, setMissingWordErrors] = useState(false);

  const maxNumber = 69;
  const drawerWidth = 140;

  const onImagesChange = async (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    if (addUpdateIndex) {
      imageUploadIndexes.current.push(addUpdateIndex[0])
      // @ts-ignore
      imageList.map(async ({ dataURL, file }) => await getImageDimensions(dataURL ?? '').then(({ w, h }) => {
        file && Object.assign(file, { dimensions: [w, h] })

        setImages({ imageList, addUpdateIndex: imageUploadIndexes.current })
      }
      ))
    } else {
      imageUploadIndexes.current.pop()
      setImages({ imageList, addUpdateIndex: imageUploadIndexes.current })
    }
  }

  let answers: [][]
  // const rawAnswerArray = useRef<GridCellProps[][]>([])
  // const textArray = textAreaText.toUpperCase().split((/\s+/)).filter((word: string) => word !== '')

  useEffect(() => {
    squareSize.current = (pdfPreviewWidth - pdfPreviewWidth / 5) / 10
    // wordMazeCornerP1a.current = { x: (pdfPreviewWidth - squareSize.current * 10) / 2, y: pdfPreviewHeight * 2 / 6 }
    // answerStartPosition.current = {
    //   x: (pdfPreviewWidth - squareSize.current * 10) / 2,
    //   y: squareSize.current * 10 + pdfPreviewHeight * 2 / 6 + squareSize.current
    // }
  }, [pdfPreviewHeight, pdfPreviewWidth, images, texts, pdfSize])

  const fillGridWithLetters = (
    id: string,
    grid: GridCellProps[],
    textArray: string[],
    wordListIndex: number,
    gridSize: number,
    textAreaText: TextsProps[]
  ) => {
    let newLetterGrid
    let newLetterGridWithProps

    const findLongestStringLength = (arr: string[][]) => {
      if (!arr || arr.length === 0) {
        return 0;
      }
      return Math.max(...arr.map(str => str.length));
    }
    const foundGridWithProps = createGridWithProps.find((item) => item[0].id === id);
    
    if (foundGridWithProps) {
      newLetterGrid = [...createGrid]
      foundGridWithProps[0].answerList = filterAnswerArray(answers)
      foundGridWithProps[0].grid = createGrid[wordListIndex]
      foundGridWithProps[0].gridSize = gridSize
      // foundGridWithProps[0].answerW = filterAnswerArray(answers).length * 20,
      // foundGridWithProps[0].answerH = filterAnswerArray(answers).length * 20,
      // @ts-ignore
      foundGridWithProps[0].answerH = filterAnswerArray(answers).length * 20 / textAreaText.find((item) => item.id === id)?.answerColumns
      // @ts-ignore
      foundGridWithProps[0].answerW = findLongestStringLength(filterAnswerArray(answers)) * 10 * (textAreaText.find((item) => item.id === id)?.answerColumns * 1.4)


      newLetterGridWithProps = [...createGridWithProps]
    } else {
      newLetterGrid = [...createGrid, [...grid]];
          console.log('id', id, 'newLetterGrid', newLetterGrid)
      newLetterGridWithProps = [...createGridWithProps, [{
        id,
        grid,
        pageNumber: currentPage,
        answerList: filterAnswerArray(answers),
        gridSize,
        x: 0,
        y: 0,
        w: squareSize.current * gridSize / 4,
        h: squareSize.current * gridSize / 4,
        answerX: 0,
        answerY: 0,
        // @ts-ignore
        answerW: findLongestStringLength(filterAnswerArray(answers)) * 10 * (textAreaText.find((item) => item.id === id)?.answerColumns * 1.4),
        // @ts-ignore
        answerH: filterAnswerArray(answers).length * 20 / textAreaText.find((item) => item.id === id)?.answerColumns,
        // @ts-ignore
        answerColumns: textAreaText.find((item) => item.id === id)?.answerColumns ?? 1,
        // @ts-ignore
        answerFont: textAreaText.find((item) => item.id === id)?.answerFont ?? 'Roboto',
        // @ts-ignore
        answerColor: textAreaText.find((item) => item.id === id)?.answerColor ?? '#000000',
        // @ts-ignore
        mazeBorderSize: textAreaText.find((item) => item.id === id)?.mazeBorderSize ?? 2,
        // @ts-ignore
        mazeBorderColor: textAreaText.find((item) => item.id === id)?.mazeBorderColor ?? 'black',
        // @ts-ignore
        mazeFont: textAreaText.find((item) => item.id === id)?.mazeFont ?? 'Roboto',
        // @ts-ignore
        mazeColor: textAreaText.find((item) => item.id === id)?.mazeColor ?? '#000000'
      }]]
    }

    const unusedWordIndexes: number[] = [];
    answers.map((item, index) => item.length === 0 && unusedWordIndexes.push(index));
    const unusedWords = textArray.filter((_, index: number) => unusedWordIndexes.includes(index));

    if (unusedWords.length > 0) {
      // Filter free horizontal spaces and fill them with unused words
      const filterVerticalSpaces = freeVerticalSpaceFilter(unusedWords, grid);
      // @ts-ignore
      answers = fillInHorizontalAnswer(unusedWords, answers, filterVerticalSpaces);

      const filteredHorizontalFreeSpaces = freeSpaceFilter(unusedWords, grid);
      // @ts-ignore
      answers = fillInHorizontalAnswer(unusedWords, answers, filteredHorizontalFreeSpaces);
    }

    const unusedCells = grid.filter((item: { letter: string | undefined }) => item.letter === '' || item.letter === undefined || item.letter === ' ');

    unusedCells.forEach((item: { letter: string }) => { item.letter = randomLetterGenerator() })

    setCreateGridWithProps(newLetterGridWithProps)
    setCreateGrid(newLetterGrid)

    return ({ answers: answers, newGrid: newLetterGrid })
  }

  const generateWordSearch = (
    id: string,
    gridIndex: number,
    textArray: string[],
    size: number,
    textAreaText: TextsProps[],
    initialX?: number,
    initialY?: number
  ) => {
    // textAreaText.toUpperCase().split((/\s+/)).filter((word: string) => word !== '')

    // for (let i = 0; i < 1; i += 1) {
      const emptyGrid = generateGrid(size, initialX, initialY)

      if (createGrid[gridIndex]) {
        // @ts-ignore
        answers = Words(createGrid[gridIndex] = emptyGrid, textArray, size)
        // answers = generateWordSearchMaze(createGrid[gridIndex], textArray, size)
      } else {
        // @ts-ignore
        answers = Words(emptyGrid, textArray, size)

        // answers = generateWordSearchMaze(emptyGrid, textArray, size)
      }

      let newGrid1 = [[]]
      let answers1
      if (textArray.length !== 0 && textArray.length === answers.length) {
        console.log('createGrid[gridIndex]',createGrid, createGrid[0])
        if (createGrid[0]) {
          const { answers, newGrid } = fillGridWithLetters(id, createGrid[gridIndex] = emptyGrid, textArray, gridIndex, size, textAreaText)
          // @ts-ignore
          newGrid1 = newGrid
          answers1 = answers
        } else {
          const { answers, newGrid } = fillGridWithLetters(id, emptyGrid, textArray, gridIndex, size, textAreaText)
          // @ts-ignore
          newGrid1 = newGrid
          answers1 = answers
        }

        // const answerArray = preFilteredAnswerArray.map((item: { letter: any }[]) => item.map(({ letter }) => letter).join(''))
        // validAnswers.current = answerArray.filter((answer: any) => textArray.includes(answer))

      }
      // setSuccess(true);

      // if (tooLongWords.length > 0) {
      //   handleAlertOpen(`These words are too long: ${tooLongWords.join(', ')}`, 'warning');
      // }
      return { grid: newGrid1[gridIndex], answers: answers1 }
    // }
  }

  const handleMazeDelete = (id: string) => {
    const newTextArea = textAreaText.filter((item) => item.id !== id)
    const newCreateGridWithProps = createGridWithProps.filter((item) => item[0].id !== id)
    setTextAreaText(newTextArea)
    setCreateGridWithProps(newCreateGridWithProps)
  }

  const handleMazeTextInput = (textArray: string[], id: string) => {
    const newTexts = [...textAreaText]
    const foundText = textAreaText.find((item) => item.id === id);
    if (foundText) {
      foundText.pageNumber = currentPage
      foundText.value = textArray
    }

    setTextAreaText(newTexts)
  }

  const handleGameGridSizeInput = (size: number, id: string) => {
    const newGameGridSize = [...gameGridSize]
    const foundGameGridSize = gameGridSize.find((item) => item.id === id);
    if (foundGameGridSize) {
      foundGameGridSize.gridSize = size
      foundGameGridSize.pageNumber = currentPage
    }

    setGamGridSize(newGameGridSize)
  }

  const addNewMazeTextFIeld = (
    pageNumber: string,
  ) => {
    const id = uuids4()
    const newGameGridSize = [...gameGridSize, {
      id,
      gridSize: 10,
      pageNumber,
    }]
    const newTexts = [...textAreaText, {
      id,
      value: [],
      pageNumber,
      answerColumns: 1,
      answerFont: 'Roboto',
      answerColor: '#000000',
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000'
    }]
    setGamGridSize(newGameGridSize)
    return setTextAreaText(newTexts)
  }

  const handleTextDelete = (id: string) => {
    setTexts(l => l.filter(item => item.id !== id));
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newTexts = [...texts]
    const foundText = texts.find((item) => item.id === id);
    if (foundText) {
      foundText.value = event.target.value;
    }

    setTexts(newTexts)
  }

  const handleTextAlign = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newTexts = [...texts]
    const foundText = texts.find((item) => item.id === id);
    if (foundText) {
      // @ts-ignore
      foundText.align = event.target.value;
    }

    setTexts(newTexts)
  }

  const handleFontSize = (event: SelectChangeEvent<number>, id: string) => {
    const newTexts = [...texts]
    const foundText = texts.find((item) => item.id === id);
    if (foundText) {
      foundText.size = event.target.value as number;
    }

    setTexts(newTexts)
  }

  const handleAnswerFont = (event: SelectChangeEvent<string>, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const newFullGrid = [...createGridWithProps]
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].answerFont = event.target.value;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.answerFont = event.target.value;
    }

    setMazeProps(newCreateGridWithProps)
  }

  const handleAnswerColumns = (number: number, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const newFullGrid = [...createGridWithProps]
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].answerColumns = number;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.answerColumns = number;
    }

    setMazeProps(newCreateGridWithProps)
  }

  const handleMazeFont = (event: SelectChangeEvent<string>, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const newFullGrid = [...createGridWithProps]
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeFont = event.target.value;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeFont = event.target.value;
    }

    setMazeProps(newCreateGridWithProps)
  }

  const handleMazeBorderSize = (number: number, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const newFullGrid = [...createGridWithProps]
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeBorderSize = number;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeBorderSize = number;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleMazeBorderColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeBorderColor = color;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeBorderColor = color;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleMazeColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeColor = color;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeColor = color;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleAnswerColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0].id === id);
    if (foundFullGrid) {
      foundFullGrid[0].answerColor = color;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.answerColor = color;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleTextColor = (color: string, id: string) => {
    const newTexts = [...texts]
    const foundText = texts.find((item) => item.id === id);
    if (foundText) {
      foundText.color = color;
    }

    setTexts(newTexts)
  }
  const handleFontFamily = (event: SelectChangeEvent<string>, id: string) => {
    const newTexts = [...texts]
    const foundText = texts.find((item) => item.id === id);
    if (foundText) {
      foundText.font = event.target.value;
    }

    setTexts(newTexts)
  }

  const addTextField = () => {
    const newTexts = [...texts]
    const fontSize = 24

    newTexts.push(
      {
        id: uuids4(),
        width: 100,
        value: '',
        initialPosition: { x: 0, y: 0 },
        // initialPosition: { x: pdfPreviewWidth / 4, y: pdfPreviewHeight * 2 / 12 + fontSize },
        font: 'Roboto',
        size: fontSize,
        pageNumber: currentPage,
        color: '#000000',
        align: 'left'
      }
    )

    setTexts(newTexts)
  }

  const handlePdfSizeChange = (size: pdfSizesListProps['size']) => {
    setPdfSize(size)
    initialWordMazeGeneration.current = true
  }

  const pdfSizesList: pdfSizesListProps[] = [
    { name: 'A4', size: [595.28, 841.89] },
    { name: '8.5 x 11', size: [612, 792] },
    { name: '8 x 10', size: [576, 720] },
    { name: '6 x 9', size: [432, 648] },
    { name: '5.5 x 8.5', size: [396, 612] },
  ]

  const fontCall = async () => {
    const REACT_APP_GOOGLE_FONT_API_KEY = 'AIzaSyBSGaurJw4doiyDDoAlK0S29d2fjRxr5RE'
    const apiKey = REACT_APP_GOOGLE_FONT_API_KEY
    const fonts = ['Open+Sans', 'Roboto',
      'DynaPuff', 'Pacifico', 'Delius', 'Comic Relief', 'Meow Script', 'Delius Unicase', 'Emilys Candy'
    ]
    const fontUrlBase = [`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`]
    fonts.map((font) => { fontUrlBase.push(`&family=${font}`) })
    const response = await fetch(fontUrlBase.join(''))
    const data = await response.json()

    return data
  }

  useEffect(() => {
    fontCall().then((data) => {
      // @ts-ignore
      const fontFamilies = data.items.map(font => font.family);
      setFonts(fontFamilies);
    })
      .catch(() => {
        // setLoading(false)
      })
  }, []);


  const [openedToolPage, setOpenedToolPage] = useState('page')

  const addPage = (pageNumbers: any[]) => {
    const newPages = [
      // ...pages,
      ...pageNumbers
    ]

    const [...newPageGridWithProps] = createGridWithProps.filter((item) => item[0].pageNumber === '1').map((item, indx) => {
      const idsArray = pageNumbers.map(() => {
        return (
          { id: uuids4() }
        )
      })

      const [...newTextArea] = pageNumbers.map((pages: {
        wordMazeArray: string[];
        pageNumber: string | number;
        answerColumns: number;
        answerFont: string;
        answerColor: string;
        mazeBorderSize: number;
        mazeBorderColor: string;
        mazeFont: string;
        mazeColor: string;
      }, index: string | number) => {
        return (
          {
            // @ts-ignore
            id: idsArray[index].id,
            value: pages?.wordMazeArray?.length ? pages.wordMazeArray[indx] : '',
            pageNumber: pages.pageNumber,
            answerColumns: textAreaText[0].answerColumns,
            answerFont: textAreaText[0].answerFont,
            answerColor: textAreaText[0].answerColor,
            mazeBorderSize: textAreaText[0].mazeBorderSize,
            mazeBorderColor: textAreaText[0].mazeBorderColor,
            mazeFont: textAreaText[0].mazeFont,
            mazeColor: textAreaText[0].mazeColor
          }
        )
      })

      const [...newGameGridSize] = pageNumbers.map((pages: { pageNumber: string | number; }, index: string | number) => {
        return (
          {
            // @ts-ignore
            id: idsArray[index].id,
            gridSize: item[0].gridSize,
            pageNumber: pages.pageNumber
          }
        )
      })

      const gridArray = pageNumbers.map((pages: { wordMazeArray: { [x: string]: string; }; pageNumber: string | number; }, index: string | number) => {
        // @ts-ignore
        const gridWords = generateWordSearch(idsArray[index].id, 0, pages.wordMazeArray[indx], item[0].gridSize, textAreaText)
        // @ts-ignore
        pages.error = Boolean(!gridWords?.answers)

        return ([
          {
            // @ts-ignore
            id: idsArray[index].id,
            grid: gridWords?.grid ?? [],
            answerList: gridWords?.answers ?? [],
            pageNumber: pages.pageNumber,
            gridSize: item[0].gridSize,
            x: item[0].x,
            y: item[0].y,
            w: item[0].w,
            h: item[0].h,
            answerX: item[0].answerX,
            answerY: item[0].answerY,
            answerW: item[0].answerW,
            answerH: item[0].answerH,
            answerColumns: item[0].answerColumns,
            answerFont: item[0].answerFont,
            answerColor: item[0].answerColor,
            mazeFont: item[0].mazeFont,
            mazeColor: item[0].mazeColor,
            mazeBorderSize: item[0].mazeBorderSize,
            mazeBorderColor: item[0].mazeBorderColor,
            error: Boolean(!gridWords?.answers)
          }]
        )
      })
      return ({ gridArray, newTextArea, newGameGridSize })
    })

    const templatePageText = texts.filter((item) => item.pageNumber === '1')

    const newInputTexts = templatePageText.map((item, index) => {
      const textsArray = pageNumbers.map((pages) => {
        const newId = uuids4()
        return (
          {
            id: newId,
            width: item.width,
            value: pages?.text?.length ? pages.text[index] : item.value,
            initialPosition: { x: item.initialPosition.x, y: item.initialPosition.y },
            font: item.font,
            size: item.size,
            color: item.color,
            align: item.align,
            pageNumber: pages.pageNumber
          }
        )
      })
      return (textsArray.flat())
    })


    const newImagesDragged = imagesDragged.filter((item) => item.pageNumber === '1').map((item, index) => {
      const imagesArray = pageNumbers.map((pages) => {
        const newId = uuids4()
        return (
          {
            id: newId,
            x: item.x,
            y: item.y,
            src: pages?.image?.length ? pages.image[index] : item.src,
            pageNumber: pages.pageNumber,
            w: item.w,
            h: item.h
          }
        )
      })

      return (imagesArray.flat())
    })

    const gridFromProps = newPageGridWithProps.map(({ gridArray }) => gridArray)
    const textFromProps = newPageGridWithProps.map(({ newTextArea }) => newTextArea)
    const gameGridSizeFromProps = newPageGridWithProps.map(({ newGameGridSize }) => newGameGridSize)
    // @ts-ignore
    setGameGridSize([...gameGridSize, ...gameGridSizeFromProps.flat() ?? []])
    //  @ts-ignore
    setTextAreaText([...textFromProps.flat() ?? []])
    setTexts([...newInputTexts.flat() ?? []])
    setImagesDragged([...imagesDragged, ...newImagesDragged.flat() ?? []])
    // @ts-ignore
    setCreateGridWithProps([
      ...gridFromProps.flat() ?? []
    ])

    // setGamGridSize([...gameGridSize, ...gameGridSizeFromProps.flat() ?? []])
    // setTextAreaText([...textAreaText, ...textFromProps.flat() ?? []])
    // setTexts([ ...texts, ...newInputTexts.flat() ?? []])
    // setImagesDragged([...imagesDragged, ...newImagesDragged.flat() ?? []])

    // setCreateGridWithProps([
    //   ...createGridWithProps,
    //   ...gridFromProps.flat() ?? []
    // ])
    setPages(newPages)
  }
// @ts-ignore
  const addTemplatePage = ({ text, wordMazeArray }) => {
    const newTexts = [...texts]
// @ts-ignore
    text.map((item) => {
      newTexts.push(
        {
          id: item.id ?? uuids4(),
          width: item.width ?? 100,
          value: item.value ?? '',
          initialPosition: item.initialPosition ?? { x: 0, y: 0 },
          font: item.font ?? 'Roboto',
          size: item.size ?? 32,
          color: item.color ?? '#000000',
          align: item.align ?? 'left',
          pageNumber: currentPage
        }
      )
    })
// @ts-ignore
    const [...newGameGridSize] = wordMazeArray.map((item) => {
      return (
        {
          id: item.id,
          gridSize: item.gridSize,
          pageNumber: currentPage,
        })
    })
// @ts-ignore
    const [...newTextArea] = wordMazeArray.map((item) => {
      return (
        {
          id: item.id,
          value: item.answerArray,
          pageNumber: currentPage,
          answerColumns: item.answerColumns ?? 1,
          answerFont: item.answerFont ?? 'Roboto',
          answerColor: item.answerColor ?? '#000000',
          mazeBorderSize: item.mazeBorderSize ?? 2,
          mazeBorderColor: item.mazeBorderColor ?? 'red',
          mazeFont: item.mazeFont ?? 'Roboto',
          mazeColor: item.mazeColor ?? '#000000'
        })

    })
// @ts-ignore
    const [...newPageGridWithProps] = wordMazeArray.map((item) => {
      const mazeData = generateWordSearch(item.id, 0, item.answerArray, 10, newTextArea)
      return ([{
        id: item.id,
        grid: mazeData?.grid ?? [],
        answerList: mazeData?.answers ?? [],
        pageNumber: currentPage,
        gridSize: item.gridSize ?? 10,
        x: item.x ?? 0,
        y: item.y ?? 0,
        w: item.w ?? squareSize.current * 10 / 2,
        h: item.h ?? squareSize.current * 10 / 2,
        answerX: item.answerX ?? 0,
        answerY: item.answerY ?? 0,
        answerW: item.answerW ?? 0,
        answerH: filterAnswerArray(answers).length * 20 / newTextArea.find((txt: { id: string; }) => txt.id === item.id)?.answerColumns,
        answerColumns: item.answerColumns ?? 1,
        answerFont: item.answerFont ?? 'Roboto',
        answerColor: item.answerColor ?? '#000000',
        mazeBorderSize: item.mazeBorderSize ?? 2,
        mazeBorderColor: item.mazeBorderColor ?? 'black',
        mazeFont: item.mazeFont ?? 'Roboto',
        mazeColor: item.mazeColor ?? '#000000',
      }])
    })

    setGamGridSize([...gameGridSize, ...newGameGridSize])
    setTextAreaText([...textAreaText, ...newTextArea])
    setCreateGridWithProps([...createGridWithProps, ...newPageGridWithProps])
    setTexts(newTexts)
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid container sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', height: "100%" }} className={styles.main2}>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Grid container className={styles.main} >
            {/* <DrawerList/> */}
            <Box sx={{ display: 'flex' }}>
              <CssBaseline />
              <Drawer
                variant="permanent"
                PaperProps={{
                  sx: {
                    backgroundColor: "#FCD0F4",
                  }
                }}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
              >
                {/* <Toolbar /> */}
                <Box sx={{ overflow: 'auto' }}>
                  <Box
                    className={styles.hide_slide_down}
                    sx={{
                      borderBottom: '1px solid #FCD0F4',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      height: '6rem',
                      // bottom: slideBottom,
                      background: "#030303"
                    }}
                  >
                    <div className={`${styles.logo_title_wrapper}`}>
                      {/* <Box sx={{ position: 'relative', padding: '2rem', marginRight: '2rem', marginLeft: '0.5rem' }} className={styles.height6}>
                        <Image
                          src={logo}
                          alt="Word Search Maze"
                          fill
                          sizes="(max-width: 70px) 100vw, (max-width: 58px) 50vw"
                        />
                      </Box> */}
                      {Logo}
                      {/* <h2>Enjoy Word Search, Create Your Book and Sell It!</h2> */}
                    </div>
                  </Box>
                  <List sx={{ paddingTop: 0 }}>
                    {[
                      { text: 'Page', value: 'page', icon: <DescriptionIcon /> },
                      { text: 'Texts', value: 'texts', icon: <TextFieldsIcon /> },
                      { text: 'Images', value: 'images', icon: <ImageIcon /> },
                      { text: 'Word mazes', value: 'maze', icon: <GridViewIcon /> }
                    ].map(({ text, icon, value }) => (
                      <ListItem key={text} disablePadding>
                        <ListItemButton
                          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', '&.Mui-selected': { backgroundColor: '#ffff47' } }}
                          onClick={() => setOpenedToolPage(value)}
                          selected={openedToolPage === value}
                        >
                          <ListItemIcon sx={{ justifyContent: 'center' }}>
                            {icon}
                          </ListItemIcon>
                          <ListItemText primary={text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                  {/* <List>
                    {['All mail', 'Trash', 'Spam'].map((text, index) => (
                      <ListItem key={text} disablePadding>
                        <ListItemButton>
                          <ListItemIcon>
                            {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                          </ListItemIcon>
                          <ListItemText primary={text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List> */}
                </Box>
              </Drawer>
              <Box component="main" sx={{ flexGrow: 1, p: 3, width: '500px' }}>
                {openedToolPage === 'page' &&
                  <>
                    <Box sx={{ mb: '1rem' }}>
                      <FormLabel sx={{ display: 'block', marginBottom: '10px' }}>Page size</FormLabel>
                      <ButtonGroup size="small" aria-label="small button group">
                        {pdfSizesList.map(({ name, size }) => (
                          <Button
                            sx={{
                              backgroundColor: pdfSize[0] === size[0] ? '#fcd0f4' : 'none',
                              color: 'grey',
                              border: '1px solid grey',
                            }}
                            onClick={() => handlePdfSizeChange(size)}
                            variant="outlined"
                            key={name}
                          >
                            {name}
                          </Button>
                        )
                        )}
                      </ButtonGroup>
                    </Box>
                    <Button onClick={() => {
                      addTemplatePage(firstTemplate(pdfPreviewHeight, pdfSize))
                    }}>
                      Add template 1
                    </Button>
                    <Button onClick={() => {
                      addTemplatePage(secondTemplate(pdfPreviewHeight, pdfSize))
                    }}>
                      Add template 2
                    </Button>
                    <Button onClick={() => {
                      addTemplatePage(thirdTemplate(pdfPreviewHeight, pdfSize))
                    }}>
                      Add template 3
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() =>
                        addPage([{
                          pageNumber: (pages.length + 1).toString(),
                          // text: [],
                          // wordMazeArray: [],
                          // image: []
                        }])
                      }
                      size='small'
                      startIcon={<AddIcon />}
                      sx={{
                        '&.MuiButton-contained': {
                          backgroundColor: '#fcd0f4',
                          color: 'black',
                          borderRadius: '25px',
                          padding: '15px 40px',
                          marginRight: '20px'
                        }
                      }}
                    >
                      Add page
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() => setOpenBulkPageModal(true)}
                      size='small'
                      startIcon={<AutoAwesomeIcon />}
                      sx={{
                        '&.MuiButton-contained': {
                          backgroundColor: '#a54efc',
                          color: 'black',
                          borderRadius: '25px',
                          padding: '15px 40px',
                        }
                      }}
                    >
                      Generate with AI
                    </Button>
                    <Modal
                      open={openBulkPageModal}
                      onClose={() => setOpenBulkPageModal(false)}
                      aria-labelledby="child-modal-title"
                      aria-describedby="child-modal-description"
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '70vw',
                          bgcolor: 'background.paper',
                          border: '1px solid grey',
                          boxShadow: 24,
                          pt: 2,
                          px: 4,
                          pb: 3,
                          backgroundColor: '#f5f5f5',
                          color: 'grey'
                        }}>
                        <FormLabel sx={{ display: 'block', marginBottom: '10px' }}>Generate multiple pages with AI</FormLabel>
                        <p id="child-modal-description">
                          Your first page will be used as template for style of generated pages.
                        </p>
                        <Box sx={{ marginTop: '20px' }}>
                          <NumberInput
                            value={amountOfPages}
                            // @ts-ignore
                            onChange={(number) => setAmountOfPages(number)}
                            label="Number of pages:"
                          />
                          <Box sx={{ marginBottom: '20px' }}>
                            <Typography sx={{ marginTop: '10px', fontSize: '14px' }}>Description for AI:</Typography>
                            <TextField sx={{ width: '100%' }} value={puzzleDescriptionForAi} onChange={(e) => setPuzzleDescriptionForAi(e.target.value)} placeholder="Theme, rules for content, anything..."></TextField>
                          </Box>
                          {loadAiCall
                            ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <div className={styles.loader}></div>
                            </Box>
                            : pages.map((page, index) => {
                              return (
                                <Accordion key={index} sx={{ marginBottom: '20px' }}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                  >
                                    {/* @ts-ignore */}
                                    {page.error && <WarningAmberIcon color="warning" sx={{ marginRight: '10px' }} />}
                                    <Typography component="span">Page {page.pageNumber}</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {texts.filter((item) => item.pageNumber === page.pageNumber).map(({ value, id }, index) => (
                                      <textarea
                                        key={index}
                                        className={styles.text_input_maze}
                                        placeholder='Text'
                                        // @ts-ignore
                                        onChange={(e) => handleTextInput(e, id)}
                                        value={value}
                                      />
                                    ))}
                                    {textAreaText.filter((item) => item.pageNumber === page.pageNumber).map(({ id, value }, index) =>
                                      <Box key={index}>

                                        {/* <Autocomplete
                                        clearIcon={false}
                                        value={value}
                                        options={[]}
                                        freeSolo
                                        multiple
                                        onChange={(e) => handleMazeTextInput(e, id)}
                                        renderTags={(value) => {
                                          return (
                                            value.map((option, index) => (
                                              <Chip key={index} label={option} onDelete={(e) => {
                                                const newTexts = [...textAreaText]
                                                const foundText = textAreaText.find((item) => item.id === id);
                                                foundText?.value.splice(index, 1)
                                                value.splice(index, 1)
                                                setTextAreaText(newTexts)
                                              }} />
                                            ))
                                          )
                                        }}
                                        renderInput={(params) => <TextField label="Add Tags" {...params} />}
                                      /> */}
                                        <Autocomplete
                                          clearIcon={false}
                                          options={[]}
                                          value={value}
                                          freeSolo
                                          multiple
                                          sx={{ marginBottom: '10px' }}
                                          onChange={(_, newValue) => {
                                            // Handle the change normally
                                            handleMazeTextInput(newValue, id);
                                          }}
                                          onPaste={(event) => {
                                            // Handle paste event specifically
                                            const pastedText = event.clipboardData.getData('text');
                                            if (pastedText.includes(',')) {
                                              event.preventDefault(); // Prevent default paste behavior

                                              const newTags = pastedText
                                                .split(',')
                                                .map(tag => tag.trim())
                                                .filter(tag => tag.length > 0);

                                              const combinedValues = [...new Set([...value, ...newTags])];
                                              handleMazeTextInput(combinedValues, id);
                                            }
                                          }}
                                          renderTags={(value) => {
                                            return (
                                              value.map((option, index) => (
                                                <Chip
                                                  key={index}
                                                  label={option}
                                                  onDelete={(e) => {
                                                    const newTexts = [...textAreaText];
                                                    // const foundText = textAreaText.find((item) => item.id === id);
                                                    // if (foundText) {
                                                    //   foundText.value.splice(index, 1);
                                                    // }
                                                    const newValue = [...value];
                                                    newValue.splice(index, 1);
                                                    setTextAreaText(newTexts);

                                                    // Also update the component's value state
                                                    handleMazeTextInput(newValue, id);
                                                  }}
                                                />
                                              ))
                                            );
                                          }}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Add Tags by pressing enter"
                                              placeholder="Type tags..."
                                              helperText="Paste a comma-separated list to enter multiple tags"
                                            />
                                          )}
                                        />
                                        {/* @ts-ignore */}
                                        {createGridWithProps.find((item) => item[0].id === id && item[0].error === true) &&
                                          <Alert severity="warning">Word maze generation failed, try to regenerate it in Word maze section for page {page.pageNumber}.</Alert>
                                        }
                                      </Box>
                                    )}
                                  </AccordionDetails>
                                </Accordion>
                              )
                            })
                          }

                          <Button
                            variant='contained'
                            onClick={() => {
                              setLoadAiCall(true)
                              async function generatePageObjects(endPage: number, startPage: number) {
                                const descriptionBase = `
                                Role: You are an expert puzzle creator specializing in engaging word search books.
                                Your task is to generate unique content for multiple pages of a word search book based on a given theme.

                                Task:
                                Generate content for ${amountOfPages} unique word search puzzle pages.
                                The central theme for the book is: ${puzzleDescriptionForAi}.

                                For each of the ${amountOfPages} pages, you must generate:

                                ${texts.map((item) => `Distinct text that is ${item.value}`).join(' and ')}.

                                ${createGridWithProps.length} lists of ${createGridWithProps.map((item) =>
                                  // @ts-ignore
                                  item[0].gridSize - 2).join(' and ')} words highly relevant to the book's theme.

                                Critical Constraints:

                                Every word in the word list MUST NOT exceed ${createGridWithProps.map((item) => item[0].gridSize).join(' and ')} characters in length.

                                The title, description, and word list for each page must be distinct from all other pages to ensure variety.

                                Your final output MUST be a single, valid JSON array containing the page objects. Do not include any text or explanations outside of the JSON structure.

                                Required JSON Output Structure:
                                Your response must be an array of objects, where each object represents a single page and follows this exact structure:

                                [
                                  {
                                    "text": [
                                      "Page Title String",
                                      "Page Description String"
                                    ],
                                    "wordMazeArray": [[
                                      "WORD1",
                                      "WORD2",
                                      "WORD3",
                                      ...
                                    ],
                                    [
                                      "OTHER_WORD",
                                      "OTHER_WORD2",
                                      "OTHER_WORD3",
                                      ...
                                    ]]
                                  },
                                  ...
                                ]

                                Example:
                                If the request was for 1 page about "Classic Cars" with 9 words, the output should look like this:

                                [
                                  {
                                    "text": [
                                      "Vintage Roadsters",
                                      "Find the names of iconic and beautiful classic cars from a golden age of auto design."
                                    ],
                                    "wordMazeArray": [[
                                      "MUSTANG",
                                      "COUPE",
                                      "SEDAN",
                                      "VINTAGE",
                                      "ENGINE",
                                      "CHROME",
                                      "CLASSIC",
                                      "ROADSTER",
                                      "CONVERT",
                                    ],
                                    "wordMazeArray": [[
                                      "DODGE",
                                      "FERRARI",
                                    ]]
                                  }
                                ]

                                Now, generate the complete JSON array for ${amountOfPages} pages based on the theme: ${puzzleDescriptionForAi}.
                                If in theme description include different rules for content, please follow them.`

                                return geminiAiCall(descriptionBase).then((response) => {
                                  console.log('response', response)
// @ts-ignore
                                  const pageArray: any[] | PromiseLike<any[]> = [];
                                  {/* @ts-ignore */}
                                  response.map((item, index) => {
                                    pageArray.push({
                                      pageNumber: (index + 1).toString(),
                                      text: item.text || [],
                                      wordMazeArray: item.wordMazeArray || [[]],
                                      image: []
                                    });
                                  })
                                  setLoadAiCall(false)

                                  // for (let i = startPage; i <= startPage + endPage - 1; i++) {
                                  //   let index = 0;
                                  //   console.log('pages', pages)
                                  //   pageArray.push({
                                  //     pageNumber: i.toString(),
                                  //     text: response[index].text || [],
                                  //     wordMazeArray: [response[index].wordMazeArray] || [[]],
                                  //     image: []
                                  //   });
                                  //   index += 1;
                                  // }
                                  return pageArray
                                }).catch((error) => {
                                  console.error('Error generating page objects:', error);
                                  setLoadAiCall(false)
                                  return []
                                })
                              }
                              generatePageObjects(amountOfPages, pages.length).then((res) => addPage(res))
                            }}
                            size='small'
                            startIcon={<AutoAwesomeIcon />}
                            sx={{
                              '&.MuiButton-contained': {
                                backgroundColor: '#fcd0f4',
                                color: 'black',
                                borderRadius: '25px',
                                padding: '15px 40px',
                                marginRight: '20px'
                              }
                            }}
                          >
                            Generate pages
                          </Button>
                        </Box>
                        <IconButton
                          sx={{ position: 'absolute', right: '0', top: '0', padding: 0 }}
                          onClick={() => {
                            setOpenBulkPageModal(false)
                          }}>
                          <HighlightOffIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    </Modal>
                    {/* <Box sx={{ marginTop: '20px' }}>
                      <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">Page</FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue="female"
                          name="radio-buttons-group"
                          value={currentPage}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setCurrentPage((event.target as HTMLInputElement).value)
                          }}
                        >
                          {pages.map((_, index) => (
                            <FormControlLabel key={index} value={(index + 1).toString()} control={<Radio />} label={(index + 1).toString()} />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box> */}
                  </>
                }
                {openedToolPage === 'texts' &&
                  <>
                    <Box sx={{ mb: '1rem', width: '100%' }} >
                      {texts.filter((item) => item.pageNumber === currentPage).map(({ value, id }, index) => {
                        return (
                          <Accordion key={id}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1-content"
                              id="panel1-header"
                            >
                              <Typography component="span">Text {index + 1}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box>
                                <Box sx={{
                                  position: 'relative',
                                  paddingTop: '20px',
                                  paddingRight: '20px',
                                }}>
                                  <Box>
                                    <Textarea
                                      minRows={2}
                                      size="md"
                                      className={styles.text_input_maze}
                                      placeholder='Text'
                                      // @ts-ignore
                                      onChange={(e) => handleTextInput(e, id)}
                                      value={value}
                                      // sx={{ width: '100%', marginBottom: '10px' }}
                                      endDecorator={
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            gap: 'var(--Textarea-paddingBlock)',
                                            pt: 'var(--Textarea-paddingBlock)',
                                            borderTop: '1px solid',
                                            borderColor: 'divider',
                                            flex: 'auto',
                                            width: '100%',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                          }}>
                                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>


                                            <Select
                                              value={texts.find((item) => item.id === id)?.align}
                                              // @ts-ignore
                                              onChange={(event) => handleTextAlign(event, id)}
                                              variant="standard"
                                              sx={{
                                                marginRight: '10px',
                                                color: 'grey',
                                                '.MuiOutlinedInput-notchedOutline': {
                                                  outline: 'none',
                                                },
                                                '.MuiSelect-outlined': {
                                                  border: 'none',
                                                },
                                                '&.MuiInputBase-root': {
                                                  fontSize: '14px',
                                                  height: '40px',
                                                  fontFamily: `${texts.find((item) => item.id === id)?.align}`,
                                                }
                                              }}
                                            >
                                              {['left', 'center', 'right'].map((align) => (
                                                <MenuItem
                                                  key={align}
                                                  value={align}
                                                >
                                                  {align === 'left' ? <FormatAlignLeftIcon /> : align === 'right'
                                                    ? <FormatAlignRightIcon /> : <FormatAlignCenterIcon />}
                                                </MenuItem>
                                              ))}
                                            </Select>

                                            <Select
                                              value={texts.find((item) => item.id === id)?.font}
                                              onChange={(event) => handleFontFamily(event, id)}
                                              variant="standard"
                                              sx={{
                                                marginRight: '10px',
                                                color: 'grey',
                                                '.MuiOutlinedInput-notchedOutline': {
                                                  // border: '1.5px solid grey',
                                                  outline: 'none',
                                                },
                                                '.MuiSelect-outlined': {
                                                  border: 'none',
                                                },
                                                '&.MuiInputBase-root': {
                                                  fontSize: '14px',
                                                  height: '40px',
                                                  width: '150px',
                                                  fontFamily: `${texts.find((item) => item.id === id)?.font}`,
                                                }
                                              }}
                                            >
                                              {fonts.map((font) => (
                                                <MenuItem
                                                  key={font}
                                                  value={font}
                                                  sx={{
                                                    '&.MuiMenuItem-root': {
                                                      fontFamily: `${font}`
                                                    }
                                                  }}
                                                >
                                                  {font}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                            <ColorPicker
                                              // @ts-ignore
                                              color={texts.find((item) => item.id === id)?.color}
                                              onChange={(color) => handleTextColor(color, id)}
                                            />
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={texts.find((item) => item.id === id)?.size}
                                              variant="standard"
                                              sx={{
                                                marginRight: '10px',
                                                marginLeft: '10px',
                                                color: 'grey',
                                                '.MuiOutlinedInput-notchedOutline': {
                                                  outline: 'none',
                                                },
                                                '.MuiSelect-outlined': {
                                                  border: 'none',
                                                },
                                                '&.MuiInputBase-root': {
                                                  fontSize: '14px',
                                                  height: '40px',
                                                }
                                              }}
                                              onChange={(event) => handleFontSize(event, id)}
                                            >
                                              {
                                                [8, 9, 10, 12, 14, 16, 18, 20, 24, 30, 32, 36, 48, 60, 72, 84, 96, 108, 120, 140, 150, 170, 200].map((size) => (
                                                  <MenuItem key={size} value={size}>{size}</MenuItem>
                                                ))
                                              }
                                            </Select>

                                          </Box>
                                          {/* <Box sx={{ display: 'flex' }}>
                                            <FormLabel sx={{ display: 'block', marginBottom: '10px' }}>Font size</FormLabel>
                                            <Slider
                                              sx={{
                                                color: 'grey',
                                                '& .MuiSlider-thumb': {
                                                  color: '#FCD0F4',
                                                  border: '2px solid grey',
                                                }
                                              }}
                                              size="small"
                                              value={texts.find((item) => item.id === id)?.size}
                                              onChange={(event) => handleFontSize(event, id)}
                                              max={200}
                                              aria-label="Small"
                                              valueLabelDisplay="auto"
                                            />
                                          </Box> */}
                                        </Box>
                                      }
                                    />

                                    <IconButton
                                      sx={{ position: 'absolute', right: '0', top: '0', padding: 0 }}
                                      onClick={() => {
                                        handleTextDelete(id)
                                      }}>
                                      <HighlightOffIcon fontSize='small' />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        )
                      })}

                    </Box>
                    <Box sx={{ mb: '1rem' }}>
                      <Button
                        variant='contained'
                        size='small'
                        startIcon={<AddIcon />}
                        onClick={addTextField}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#fcd0f4',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '15px 40px',
                          }
                        }}
                      >
                        Add text field
                      </Button>
                    </Box>
                  </>
                }
                {openedToolPage === 'images' &&
                  <>
                    <Box>
                      <ImageUploading
                        multiple
                        value={images?.imageList ?? []}
                        onChange={onImagesChange}
                        maxNumber={maxNumber}
                      >
                        {({
                          imageList,
                          onImageUpload,
                          onImageRemoveAll,
                          onImageUpdate,
                          onImageRemove,
                          isDragging,
                          dragProps
                        }) => (
                          // write your building UI
                          <Box className="upload__image-wrapper">
                            <Button
                              variant='contained'
                              style={isDragging ? { color: "red" } : undefined}
                              onClick={onImageUpload}
                              startIcon={<UploadIcon />}
                              {...dragProps}
                              sx={{
                                '&.MuiButton-contained': {
                                  backgroundColor: '#fcd0f4',
                                  color: 'black',
                                  borderRadius: '25px',
                                  padding: '15px 40px',
                                }
                              }}
                            >
                              Upload image
                            </Button>
                            {/* &nbsp; */}
                            {/* <Button variant='outlined' onClick={onImageRemoveAll} startIcon={<DeleteIcon />}>Remove all images</Button> */}
                            <Box sx={{ maxWidth: '450px', display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
                              {imageList.map((image, index) => (
                                <Box key={index}
                                  onMouseEnter={e => {
                                    setShowOnHover(index);
                                  }}
                                  onMouseLeave={e => {
                                    setShowOnHover(false)
                                  }}
                                  sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
                                >
                                  {showOnHover === index &&
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        zIndex: 100,
                                        color: 'grey',
                                        backgroundColor: 'transparent',
                                        padding: '0px',
                                        '&:hover': {
                                          backgroundColor: 'transparent',
                                        }
                                      }}
                                      onClick={() => {
                                        // setDeleteImage(index)
                                        onImageRemove(index)
                                      }}>
                                      <HighlightOffIcon />
                                    </IconButton>
                                  }
                                  <Box
                                    key={index}
                                    sx={{
                                      margin: '20px', position: 'relative',
                                      '&:hover': {
                                        cursor: 'pointer'
                                      },
                                    }}
                                    onClick={() => {
                                      if (selectedImageId) {
                                        const newSelectedImage = [...imagesDragged]
                                        const img = imagesDragged.find((item) => item.id === selectedImageId)

                                        if (img) {
                                          img.src = image.dataURL
                                        }

                                        setImagesDragged(newSelectedImage)
                                        setSelectedImageId(null)
                                      } else {
                                        setImagesDragged(
                                          imagesDragged.concat([
                                            {
                                              id: uuids4(),
                                              x: 0,
                                              y: 0,
                                              src: image.dataURL,
                                              pageNumber: currentPage,
                                              // @ts-ignore
                                              w: image.file.dimensions[0],
                                              // @ts-ignore
                                              h: image.file.dimensions[1]
                                            }
                                          ])
                                        )
                                      }
                                    }}
                                  >
                                    <img
                                      src={image.dataURL}
                                      alt=""
                                      // width="200"
                                      draggable="true"
                                      style={{ borderRadius: '10px', maxWidth: '200px', maxHeight: '200px' }}
                                      onDragStart={(e) => {
                                        // @ts-ignore
                                        dragUrl.current = e.target.src;
                                      }}
                                    />
                                    {showOnHover === index &&
                                      <>
                                        <Box sx={{
                                          position: 'absolute',
                                          left: 0,
                                          right: 0,
                                          top: 0,
                                          bottom: 0,
                                          width: '100%',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          background: 'rgba(255, 255, 71, 0.5)',
                                          zIndex: 10,
                                        }}>
                                          <IconButton
                                            sx={{
                                              margin: 'auto',
                                              padding: '2px',
                                              backgroundColor: 'transparent',
                                              color: 'grey',
                                              '&:hover': {
                                                backgroundColor: 'grey',
                                                color: '#fcd0f4',
                                              },
                                            }}
                                            onClick={(e) => {
                                              if (selectedImageId) {
                                                setSelectedImageId(null)
                                              } else {
                                                setImagesDragged(
                                                  imagesDragged.concat([
                                                    {
                                                      id: uuids4(),
                                                      x: 0,
                                                      y: 0,
                                                      src: image.dataURL,
                                                      pageNumber: currentPage,
                                                      // @ts-ignore
                                                      w: image.file.dimensions[0],
                                                      // @ts-ignore
                                                      h: image.file.dimensions[1]
                                                    }
                                                  ])
                                                )
                                              }
                                            }}
                                          >

                                            {selectedImageId ? <LoopIcon /> : <AddCircleOutlineIcon />}

                                          </IconButton>
                                        </Box>
                                      </>
                                    }
                                  </Box>
                                </Box>

                              ))}
                            </Box>
                          </Box>
                        )}
                      </ImageUploading>
                    </Box>
                  </>
                }
                {openedToolPage === 'maze' &&
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid grey', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ color: 'gray' }}> Show answers</Typography>
                        <Switch
                          checked={openAnswerMarkers}
                          onChange={() => setOpenAnswerMarkers(!openAnswerMarkers)}
                          sx={{
                            '.MuiSwitch-thumb': {
                              border: '2px solid grey',
                            },
                            '.MuiSwitch-switchBase.Mui-checked': {
                              color: '#FCD0F4',
                            },
                            '.MuiSwitch-sizeMedium': {
                              color: 'grey',
                            },
                            '.MuiSwitch-track': {
                              backgroundColor: 'white',
                              border: '2px solid grey',
                            },
                            '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: 'grey',
                              border: '2px solid grey',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ marginBottom: '20px' }}>

                      {textAreaText.filter((item) => item.pageNumber === currentPage).map(({ id, value }, index) =>

                        <Accordion key={id}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                          >
                            <Typography component="span">Maze {index + 1}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box key={index} sx={{ position: 'relative', pt: '20px', paddingRight: '20px', marginBottom: '20px' }}>
                              <Box sx={{ mb: '10px' }}>
                                <FormLabel sx={{ marginBottom: '10px', marginRight: '5px' }}>Maze size: </FormLabel>
                                <ButtonGroup size="small" aria-label="small button group">
                                  {[5, 10, 15, 20, 25].map((item) => (
                                    <Button
                                      sx={{
                                        backgroundColor: gameGridSize.find(
                                          (item) => item.id === id)?.gridSize === item ? '#fcd0f4' : 'none',
                                        color: 'grey',
                                        border: '1px solid grey',
                                      }}
                                      onClick={() => {
                                        handleGameGridSizeInput(item, id)
                                        // @ts-ignore
                                        const mazeData = generateWordSearch(id, index, value, item, textAreaText)
                                        setMissingWordErrors(!mazeData?.answers)
                                      }
                                      }
                                      variant="outlined"
                                      key={item}
                                    >
                                      {item}
                                    </Button>
                                  ))}
                                </ButtonGroup>
                              </Box>
                              <Box>

                                <SwitchWithLabel label="Show answer list" checked={showAnswerList} onChange={() => setShowAnswerList(!showAnswerList)} />
                                {showAnswerList &&
                                  <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Box>
                                        <Typography sx={{ color: 'grey', fontSize: '14px' }}>Columns:</Typography>
                                        <NumberInput
                                          id={id}
                                          // @ts-ignore
                                          value={textAreaText?.find((item) => item.id === id).answerColumns}
                                          // @ts-ignore
                                          onChange={(number) => handleAnswerColumns(number, id)}
                                        />
                                      </Box>
                                      <Box>
                                        <Typography sx={{ color: 'grey', fontSize: '14px' }}>Color:</Typography>
                                        <ColorPicker
                                          // @ts-ignore
                                          color={textAreaText.find((item) => item.id === id)?.answerColor}
                                          onChange={(color) => handleAnswerColor(color, id)}
                                        />

                                      </Box>
                                      <Box>
                                        <Typography sx={{ color: 'grey', fontSize: '14px' }}>Font:</Typography>
                                        <Box sx={{ display: 'flex', marginBottom: '10px' }}>
                                          <Select
                                            value={textAreaText.find((item) => item.id === id)?.answerFont}
                                            onChange={(event) => handleAnswerFont(event, id)}
                                            variant="standard"
                                            sx={{
                                              color: 'grey',
                                              '.MuiOutlinedInput-notchedOutline': {
                                                border: '1.5px solid grey',
                                                outline: 'none',
                                              },
                                              '.MuiSelect-outlined': {
                                                border: 'none',
                                              },
                                              '&.MuiInputBase-root': {
                                                fontSize: '14px',
                                                width: '150px',
                                                fontFamily: `${textAreaText.find((item) => item.id === id)?.answerFont}`,
                                              }
                                            }}
                                          >
                                            {fonts.map((font) => (
                                              <MenuItem
                                                key={font}
                                                value={font}
                                                sx={{
                                                  '&.MuiMenuItem-root': {
                                                    fontFamily: `${font}`
                                                  }
                                                }}
                                              >
                                                {font}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </>
                                }
                                {/* <TextField
                                  type='number'
                                  value={textAreaText?.find((item) => item.id === id).mazeBorderSize}
                                  onChange={(e) => handleMazeBorderSize(e, id)}
                                /> */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    marginTop: '30px',
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    alignItems: 'flex-end',
                                    marginBottom: '20px',
                                  }}
                                >
                                  <Box sx={{ marginRight: '30px', paddingTop: '10px', }}>
                                    <Typography sx={{ color: 'grey', fontSize: '14px' }}>Maze border size</Typography>
                                    <NumberInput
                                      id={id}
                                      // @ts-ignore
                                      value={textAreaText?.find((item) => item.id === id).mazeBorderSize}
                                      // @ts-ignore
                                      onChange={handleMazeBorderSize}
                                    // label="Maze border size"
                                    />
                                  </Box>
                                  <Box>
                                    <Typography sx={{ color: 'grey', fontSize: '14px' }}>Maze border color</Typography>
                                    {/* @ts-ignore */}
                                    <ColorPicker color={textAreaText.find((item) => item.id === id)?.mazeBorderColor} onChange={(color) => handleMazeBorderColor(color, id)} />
                                  </Box>
                                </Box>


                                <Autocomplete
                                  clearIcon={false}
                                  options={[]}
                                  value={value}
                                  freeSolo
                                  multiple
                                  onChange={(e, newValue, reason) => {
                                    // Handle the change normally
                                    handleMazeTextInput(newValue, id);
                                  }}
                                  onPaste={(event) => {
                                    // Handle paste event specifically
                                    const pastedText = event.clipboardData.getData('text');
                                    if (pastedText.includes(',')) {
                                      event.preventDefault(); // Prevent default paste behavior

                                      const newTags = pastedText
                                        .split(',')
                                        .map(tag => tag.trim())
                                        .filter(tag => tag.length > 0);

                                      const combinedValues = [...new Set([...value, ...newTags])];
                                      handleMazeTextInput(combinedValues, id);
                                    }
                                  }}
                                  renderTags={(value) => {
                                    return (
                                      value.map((option, index) => (
                                        <Chip
                                          key={index}
                                          label={option}
                                          onDelete={(e) => {
                                            const newTexts = [...textAreaText];
                                            // const foundText = textAreaText.find((item) => item.id === id);
                                            // if (foundText) {
                                            //   foundText.value.splice(index, 1);
                                            // }
                                            const newValue = [...value];
                                            newValue.splice(index, 1);
                                            setTextAreaText(newTexts);

                                            // Also update the component's value state
                                            handleMazeTextInput(newValue, id);
                                          }}
                                        />
                                      ))
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      // label="Add Tags (separate with commas)"
                                      placeholder="Type tags separated by Enter..."
                                      helperText="Enter tags separated by Enter, or paste a comma-separated list"
                                    />
                                  )}
                                />
                                <Box sx={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
                                  <Box sx={{ marginRight: '20px' }}>
                                    <Typography sx={{ color: 'grey', fontSize: '14px' }}>Maze text color:</Typography>
                                    {/* @ts-ignore */}
                                    <ColorPicker color={textAreaText.find((item) => item.id === id)?.mazeColor} onChange={(color) => handleMazeColor(color, id)} />
                                  </Box>

                                  <Box>
                                    <Typography sx={{ color: 'grey', fontSize: '14px' }}>Maze text font:</Typography>

                                    <Box sx={{ display: 'flex' }}>
                                      <Select
                                        value={textAreaText.find((item) => item.id === id)?.mazeFont}
                                        onChange={(event) => handleMazeFont(event, id)}
                                        variant="standard"
                                        sx={{
                                          color: 'grey',
                                          '.MuiOutlinedInput-notchedOutline': {
                                            border: '1.5px solid grey',
                                            outline: 'none',
                                          },
                                          '.MuiSelect-outlined': {
                                            border: 'none',
                                          },
                                          '&.MuiInputBase-root': {
                                            width: '150px',
                                            fontSize: '14px',
                                            fontFamily: `${textAreaText.find((item) => item.id === id)?.mazeFont}`,
                                          }
                                        }}
                                      >
                                        {fonts.map((font) => (
                                          <MenuItem
                                            key={font}
                                            value={font}
                                            sx={{
                                              '&.MuiMenuItem-root': {
                                                fontFamily: `${font}`
                                              }
                                            }}
                                          >
                                            {font}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                              <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', marginBottom: ' 10px' }}>
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    // @ts-ignore
                                    const mazeData = generateWordSearch(id, index, value, gameGridSize.find((item) => item.id === id)?.gridSize, textAreaText)

                                    setMissingWordErrors(!mazeData?.answers)
                                  }}
                                  sx={{
                                    '&.MuiButton-contained': {
                                      backgroundColor: '#FFFF48',
                                      color: 'black',
                                      borderRadius: '5px',
                                      padding: '15px 20px',
                                      height: '40px'
                                    }
                                  }}
                                >
                                  Generate
                                </Button>
                              </Box>

                              {missingWordErrors &&
                                <Box>
                                  <Alert
                                    severity="warning"
                                  >
                                    Word maze generation failed, try again or check if there is too long words or too many words to fit in maze.
                                  </Alert>
                                </Box>
                              }

                              <IconButton
                                sx={{ position: 'absolute', right: '0', top: '0', padding: 0 }}
                                onClick={() => {
                                  handleMazeDelete(id)
                                }}>
                                <HighlightOffIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </AccordionDetails>
                        </Accordion>

                      )}
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => addNewMazeTextFIeld(currentPage)}
                      sx={{
                        '&.MuiButton-contained': {
                          backgroundColor: '#fcd0f4',
                          color: 'black',
                          borderRadius: '25px',
                          padding: '15px 40px',
                        }
                      }}
                    >
                      Add new maze
                    </Button>
                  </>
                }
              </Box>
            </Box>
          </Grid>

        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Grid
            container
            className={styles.main}
            sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center' }}
            direction="column"
            justifyContent="space-between"
            alignItems="center"
          >

            <Box
              sx={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* <Box sx={{ '& > :not(style)': { m: 1 } }}>
                  <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => handleExport(
                      {
                        pdfSize: pdfSize,
                        pages: pages,
                        createGrid: createGridWithProps,
                        images: imagesDragged,
                        showAnswerList: showAnswerList,
                        texts: texts,
                        width: pdfPreviewHeight * (pdfSize[0] / pdfSize[1]),
                        height: pdfPreviewHeight
                      }
                    )}>
                    <PictureAsPdfIcon />
                  </Fab>
                </Box> */}

              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '10px' }}>
                <Stack spacing={2}>
                  <Pagination
                    count={pages.length}
                    onChange={((e, value) => {
                      setCurrentPage(value.toString())
                    }
                    )}
                    shape="rounded"
                  />
                </Stack>
                <Button
                  variant='contained'
                  onClick={() => handleExport(
                    {
                      pdfSize: pdfSize,
                      pages: pages,
                      createGrid: createGridWithProps,
                      images: imagesDragged,
                      showAnswerList: showAnswerList,
                      texts: texts,
                      width: pdfPreviewHeight * (pdfSize[0] / pdfSize[1]),
                      height: pdfPreviewHeight
                    }
                  )}
                  sx={{
                    '&.MuiButton-contained': {
                      backgroundColor: '#FFFF48',
                      color: 'black',
                      borderRadius: '5px',
                      padding: '15px 20px',
                      height: '40px'
                    }
                  }}
                >
                  <PictureAsPdfIcon sx={{ marginRight: '5px' }} />
                  Download
                </Button>
              </Box>
              <Paper
                createGrid={createGridWithProps}
                setCreateGridWithProps={setCreateGridWithProps}
                width={pdfPreviewHeight * (pdfSize[0] / pdfSize[1])}
                height={pdfPreviewHeight}
                texts={texts}
                setTexts={setTexts}
                showAnswers={openAnswerMarkers}
                showAnswerList={showAnswerList}
                images={imagesDragged}
                setImages={setImagesDragged}
                pdfSize={pdfSize}
                ref={stageRef}
                currentPage={currentPage}
                isImageSelected={selectedImageId ? true : false}
                selectImage={(id: string) => {
                  setSelectedImageId(id)
                }}
                pages={pages}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

