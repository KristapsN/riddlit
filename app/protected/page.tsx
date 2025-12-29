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
import { useWindowSize } from '@/hooks/windowSize'
import ImageUploading, { ImageListType } from 'react-images-uploading'
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Chip, CssBaseline, Divider, Drawer, FormControl, FormControlLabel, FormLabel, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Modal, Pagination, Radio, RadioGroup, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material'
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
import { geminiAiCallWithTracking } from "@/helpers/geminiAiCall";
// import { geminiImageAiCallWithTracking } from "@/helpers/geminiImageAiCall"
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { firstTemplate, secondTemplate, thirdTemplate } from "@/helpers/layoutTemplates";
import { fontCall } from "@/helpers/getFonts"
import { createProjects, getProject, getProjects, getUser, updateProjects } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { generateCrossword } from '@/helpers/createCrosword';
import { checkTokenBalance } from '@/helpers/tokenBalanceChecker';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Script from 'next/script'

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
  randomLetterList: string
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
  randomLetterList: string
}

export interface ImagesProps {
  imageList: ImageListType
  addUpdateIndex: number[] | undefined
}

interface gridSizeProps {
  id: string
  gridSize: number
  pageNumber: string
}

interface ProjectProps {
  id: number
  name: string
}

interface crosswordPuzzleGridProps {
  x: number
  y: number
  letter: string
  horizontalNumber?: number
  verticalNumber?: number
}

export interface CrosswordPuzzleProps {
  id: string
  pageNumber: string
  grid: crosswordPuzzleGridProps[]
}

export interface CrosswordTextProps {
  id: string;
  value: string[];
  pageNumber: string;
  mazeBorderSize: number;
  mazeBorderColor: string;
  mazeFont: string;
  mazeColor: string;
  w: number
  h: number
  x: number
  y: number
  grid: crosswordPuzzleGridProps[]
}

export interface PageElementProps {
  pageNumber: string
  createGrid?: GridWithPropsProps[][]
  texts?: TextsProps
  initialSquareSize?: number
  showAnswers?: boolean
  images?: ImagesProps
  crosswordTexts?: CrosswordTextProps[]
}

export default function Maze() {

  const [crosswordText, setCrosswordText] = useState<CrosswordTextProps[]>([])
  const [gameGridSize, setGamGridSize] = useState<gridSizeProps[]>([{
    id: '1',
    gridSize: 10,
    pageNumber: '1'
  }])
  const [createGrid, setCreateGrid] = useState<GridCellProps[][]>([])
  const [createGridWithProps, setCreateGridWithProps] = useState<GridWithPropsProps[][]>([])
  // const [crosswordPuzzles, setCrosswordPuzzles] = useState<CrosswordPuzzleProps[]>([])
  const [pdfSize, setPdfSize] = useState([595.28, 841.89])
  // [210, 297])
  // [595.28, 841.89])
  const [textAreaText, setTextAreaText] = useState<MazeTextsProps[]>([])
  const [openAnswerMarkers, setOpenAnswerMarkers] = useState(false)
  const [openCrosswordAnswerMarkers, setOpenCrosswordAnswerMarkers] = useState(false)
  // @ts-ignore
  const pdfPreviewHeight = useWindowSize().height * 0.9 ?? 0
  const pdfPreviewWidth = pdfPreviewHeight * (pdfSize[0] / pdfSize[1]) * 2

  const squareSize = useRef<number>(0)
  const initialWordMazeGeneration = useRef<boolean>(true)
  const imageUploadIndexes = useRef<number[]>([])
  const [fonts, setFonts] = useState<string[]>([])
  const dragUrl = useRef('');
  const stageRef = useRef('');
  const [showOnHover, setShowOnHover] = useState<boolean | number>(false);
  const [currentPage, setCurrentPage] = useState('1')
  const [texts, setTexts] = useState<TextsProps[]>([])
  const [showAnswerList, setShowAnswerList] = useState(true)
  const [images, setImages] = useState<ImagesProps>();
  const [imagesDragged, setImagesDragged] = useState<ImageDraggedProps[]>([]);
  const [pages, setPages] = useState([{
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
  const [projects, setProjects] = useState<ProjectProps[] | null>()
  const [selectedProject, setSelectedProject] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [contentLoading, setContentLoading] = useState(true)

  const handlePdfSizeChange = (size: pdfSizesListProps['size']) => {
    setPdfSize(size)
    initialWordMazeGeneration.current = true
  }

  const pdfSizesList: pdfSizesListProps[] = [
    { name: 'A4', size: [595.28, 841.89] },
    { name: '8.5 x 11', size: [612, 792] },
    // { name: '8 x 10', size: [576, 720] },
    { name: '6 x 9', size: [432, 648] },
    { name: '5.5 x 8.5', size: [396, 612] },
  ]

  const [openCreateProject, setOpenCreateProject] = useState(false)
  const selectedProjectName = useRef('word_maze')
  const pageSize = useRef<[number, number]>([595.28, 841.89])
  const activeUser = useRef('')

  const handleProject = (id?: number) => {
    // setContentLoading(true)
    const supabase = createClient();
    getUser(supabase).then(user => {
      user && (activeUser.current = user.id)
      user && getProject(supabase, user.id).then(async (response) => {
        // response && handleProject(response)

        const tokenBalance = await checkTokenBalance(activeUser.current)

        setTokenBalance(tokenBalance)

        if (!response || (response && response.length === 0)) {
          setOpenCreateProject(true)
          return;
        }

        let project;

        if (id) {
          project = response.find((item) => item.id === id)
        } else {
          project = response.reduce((max, obj) => obj.id > max.id ? obj : max);
        }
        // @ts-ignore
        setSelectedProject(project?.id)
        selectedProjectName.current = project?.name ?? 'word_maze'

        if (!project?.project_data) {
          setOpenCreateProject(true)
          return null
        }
        setOpenCreateProject(false)
        setPages([...project.project_data])
        const maze = project.project_data.map(({ wordMazeArray }) => {
          return wordMazeArray;
        })

        const grid: any[] = []
        project.project_data.map(({ wordMazeArray }) => {
          // @ts-ignore
          grid.push(wordMazeArray?.map((item) => item[0]?.grid))
        })

        const gridSize: { id: any; gridSize: any; pageNumber: any; }[] = []
        project.project_data.map(({ wordMazeArray }) => {
          // @ts-ignore
          wordMazeArray?.map((item) => {
            // @ts-ignore
            const answerList = item[0]?.answerList.map(arr =>
              // @ts-ignore
              arr.map(obj => obj.letter).join('')
            )
            // @ts-ignore
            gridSize.push({ id: item[0]?.id, gridSize: item[0]?.gridSize, pageNumber: item[0]?.pageNumber, value: answerList })
          })
        })

        const textArea: any[] = []
        project.project_data.map(({ wordMazeArray }) => {
        // @ts-ignore
          wordMazeArray?.map((item, index) => {
            if (item.length === 0) {
              return;
            }

            textArea.push({
              id: item[0]?.id,
              gridSize: item[0]?.gridSize,
              pageNumber: item[0]?.pageNumber,
              answerColor: item[0]?.answerColor,
              answerColumns: item[0]?.answerColumns,
              answerFont: item[0]?.answerFont,
              mazeBorderColor: item[0]?.mazeBorderColor,
              mazeBorderSize: item[0]?.mazeBorderSize,
              mazeColor: item[0]?.mazeColor,
              mazeFont: item[0]?.mazeFont,
              // @ts-ignore
              value: gridSize[index].value
            })
          })
        })

        const pageImagesArray: any[] = []
        project.project_data.map(({ image }) => {
          image?.map((item: ImageDraggedProps) => {
            pageImagesArray.push({
              id: item.id,
              x: item.x,
              y: item.y,
              src: item.src,
              pageNumber: item.pageNumber,
              w: item.w,
              h: item.h
            })
          })
        })

        const allImagesList: ImageListType = []
        const allImages = project?.images?.map((img) => {
          // @ts-ignore
          allImagesList.push(img)
          return ({ addUpdateIndex: allImagesList.map((_, index) => index), imageList: allImagesList })
        })

        projectId.current = project.id
        maze[0][0].length ? setCreateGridWithProps([...maze.flat()]) : setCreateGridWithProps([])
        grid[0] && setCreateGrid([...grid])
        gridSize[0] && setGamGridSize([...gridSize])
        textArea[0] ? setTextAreaText([...textArea]) : setTextAreaText([])

        const crosswordArray = project.project_data.map(({ crossword }) => {
          return crossword;
        })
        crosswordArray[0] && setCrosswordText([...crosswordArray.flat()])
        pageImagesArray[0] ? setImagesDragged([...pageImagesArray]) : setImagesDragged([])
        allImages && allImages[0] && setImages(allImages[0])
        const texts = project.project_data.map(({ text }) => {
          return text;
        })
        const pdfPagSize = pdfSizesList.find(({ name }) => name === project.page_size)?.size
        pdfPagSize && setPdfSize(pdfPagSize)
        pdfPagSize && (pageSize.current = pdfPagSize)

        texts[0].length ? setTexts([...texts.flat()]) : setTexts([])

      }).catch((error) => {
        console.error(error)
        setContentLoading(false)
      }
      ).finally(() =>
        setContentLoading(false)
      )
    });
  }

  useEffect(() => {
    const supabase = createClient();
    handleProject()

    getUser(supabase).then(user => {
      // @ts-ignore
      window.Tawk_API.setAttributes({
        name: user?.email,
        email: user?.email,
        hash: '' // See note below about "Secure Mode"
      });
// @ts-ignore
      getProjects(supabase, user.id).then((response) => {
        setProjects(response)
        setOpenCreateProject(false)
      })
    })


  }, [])

  const projectId = useRef<number | null>(null)
  const [projectName, setProjectName] = useState('')
  const [saveLoad, setSaveLoad] = useState(false)

  const saveProject = async () => {
    setSaveLoad(true)
    projectId.current && updateProjects(projectId.current, pages, images?.imageList).then(
      () => setSaveLoad(false))
  }

  const createProjectHandler = async () => {
    const pageSize = pdfSizesList.find(({ size }) => size[0] === pdfSize[0] && size[1] === pdfSize[1])

    // projectId.current = (projects && projects?.length > 0) ? projects.reduce((max, obj) => obj.id > max.id ? obj : max).id + 1 : 1

    const supabase = createClient();
    getUser(supabase).then(user => {
      user && pageSize &&
        createProjects(
          // projectId.current,
          projectName,
          // @ts-ignore
          [{ pageNumber: '1', wordMazeArray: [[]], image: [], text: [], crossword: [] }],
          [],
          user.id,
          pageSize.name,
        ).then((data) => {
          projectId.current = data?.id
          handleProject(data?.id)
          // projectId.current && handleProject(projectId.current)

          getProjects(supabase, user.id).then((response) => {
            setProjects(response)
            setOpenCreateProject(false)
          })
          setOpenCreateProject(false)
        })
    })
  }

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
        const imageWidth = w > pdfSize[0] ? w * (pdfSize[0] / w) : w
        const imageHeight = w > pdfSize[0] ? h * (pdfSize[0] / w) : h
        file && Object.assign(file, { dimensions: [imageWidth, imageHeight] })

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
    textAreaText: MazeTextsProps[]
  ) => {
    let newLetterGrid
    let newLetterGridWithProps

    const findLongestStringLength = (arr: string[][]) => {
      if (!arr || arr.length === 0) {
        return 0;
      }
      return Math.max(...arr.map(str => str.length));
    }
    const foundGridWithProps = createGridWithProps.find((item) => item[0]?.id === id);

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
        answerColumns: textAreaText.find((item) => item.id === id)?.answerColumns ?? 1,
        answerFont: textAreaText.find((item) => item.id === id)?.answerFont ?? 'Roboto',
        answerColor: textAreaText.find((item) => item.id === id)?.answerColor ?? '#000000',
        mazeBorderSize: textAreaText.find((item) => item.id === id)?.mazeBorderSize ?? 2,
        mazeBorderColor: textAreaText.find((item) => item.id === id)?.mazeBorderColor ?? 'black',
        mazeFont: textAreaText.find((item) => item.id === id)?.mazeFont ?? 'Roboto',
        mazeColor: textAreaText.find((item) => item.id === id)?.mazeColor ?? '#000000',
        randomLetterList: textAreaText.find((item) => item.id === id)?.randomLetterList ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
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

    const newPages = pages.map((item) => {
      const txt = newLetterGridWithProps.filter((props) => props[0]?.pageNumber === item.pageNumber)
      return { ...item, wordMazeArray: txt }
    })

    setPages(newPages)

    setCreateGridWithProps(newLetterGridWithProps)
    setCreateGrid(newLetterGrid)

    return ({ answers: answers, newGrid: newLetterGrid })
  }

  const generateWordSearch = (
    id: string,
    gridIndex: number,
    textArray: string[],
    size: number,
    textAreaText: MazeTextsProps[],
    initialX?: number,
    initialY?: number
  ) => {
    // textAreaText.toUpperCase().split((/\s+/)).filter((word: string) => word !== '')

    // for (let i = 0; i < 1; i += 1) {
    const emptyGrid = generateGrid(size, initialX, initialY)

    if (createGrid[gridIndex]) {
      // @ts-ignore
      answers = Words(createGrid[gridIndex] = emptyGrid, textArray, size, textAreaText.find((item) => item.id === id)?.randomLetterList)
      // answers = generateWordSearchMaze(createGrid[gridIndex], textArray, size)
    } else {
      // @ts-ignore
      answers = Words(emptyGrid, textArray, size, textAreaText.find((item) => item.id === id)?.randomLetterList)
      // answers = generateWordSearchMaze(emptyGrid, textArray, size)
    }

    let newGrid1 = [[]]
    let answers1
    if (textArray.length !== 0 && textArray.length === answers.length) {
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
    const newCreateGridWithProps = createGridWithProps.filter((item) => item[0]?.id !== id)
    setTextAreaText(newTextArea)
    setCreateGridWithProps(newCreateGridWithProps)
  }

  const handleCrosswordDelete = (id: string) => {
    const newTextArea = crosswordText.filter((item) => item.id !== id)
    // const newCreateGridWithProps = createGridWithProps.filter((item) => item[0]?.id !== id)
    setCrosswordText(newTextArea)
    // setCreateGridWithProps(newCreateGridWithProps)
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

  const handleCrosswordTextInput = (textArray: string[], id: string) => {
    const newTexts = [...crosswordText]
    const foundText = crosswordText.find((item) => item.id === id);
    if (foundText) {
      foundText.pageNumber = currentPage
      foundText.value = textArray
    }

    setCrosswordText(newTexts)
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

  const addNewCrosswordTextField = (
    pageNumber: string,
  ) => {
    const id = uuids4()
    // const newGameGridSize = [...gameGridSize, {
    //   id,
    //   gridSize: 10,
    //   pageNumber,
    // }]
    const newTexts = [...crosswordText, {
      id,
      value: [],
      pageNumber,
      mazeBorderSize: 2,
      mazeBorderColor: 'black',
      mazeFont: 'Roboto',
      mazeColor: '#000000',
      h: squareSize.current * 4,
      w: squareSize.current * 4,
      x: 0,
      y: 0,
      grid: []
    }]
    // setGamGridSize(newGameGridSize)

    return setCrosswordText(newTexts)
  }

  const addNewMazeTextField = (
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
      mazeColor: '#000000',
      randomLetterList: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
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
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
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
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
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
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
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
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeBorderSize = number;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeBorderSize = number;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleCrosswordBorderSize = (number: number, id: string) => {
    const newCreateGridWithProps = [...crosswordText]
    const foundGrid = crosswordText.find((item) => item.id === id);
    // const newFullGrid = [...createGridWithProps]
    // const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
    // if (foundFullGrid) {
    //   foundFullGrid[0].mazeBorderSize = number;
    //   setCreateGridWithProps(newFullGrid)
    // }
    if (foundGrid) {
      foundGrid.mazeBorderSize = number;
    }
    setCrosswordText(newCreateGridWithProps)
  }

  const handleMazeBorderColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
    if (foundFullGrid) {
      foundFullGrid[0].mazeBorderColor = color;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.mazeBorderColor = color;
    }
    setMazeProps(newCreateGridWithProps)
  }

  const handleCrosswordBorderColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...crosswordText]
    const foundGrid = crosswordText.find((item) => item.id === id);
    if (foundGrid) {
      foundGrid.mazeBorderColor = color;
    }
    setCrosswordText(newCreateGridWithProps)
  }

  const handleMazeColor = (color: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
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
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
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

  const handleMazeRandomLetterList = (letters: string, id: string) => {
    const newCreateGridWithProps = [...textAreaText]
    const newFullGrid = [...createGridWithProps]
    const foundGrid = textAreaText.find((item) => item.id === id);
    const foundFullGrid = createGridWithProps.find((item) => item[0]?.id === id);
    if (foundFullGrid) {
      foundFullGrid[0].randomLetterList = letters;
      setCreateGridWithProps(newFullGrid)
    }
    if (foundGrid) {
      foundGrid.randomLetterList = letters;
    }
    setMazeProps(newCreateGridWithProps)
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

    const newPages = pages.map((item) => {
      const txt = newTexts.filter(({ pageNumber }) => pageNumber === item.pageNumber)

      return { ...item, text: txt }
    })

    setPages(newPages)
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
    const [...newPageGridWithProps] = createGridWithProps.filter((item) => item[0]?.pageNumber === '1').map((item, indx) => {
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
        randomLetterList: string;
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
            mazeColor: textAreaText[0].mazeColor,
            randomLetterList: textAreaText[0].randomLetterList
          }
        )
      })

      const [...newGameGridSize] = pageNumbers.map((pages: { pageNumber: string | number; }, index: string | number) => {
        return (
          {
            // @ts-ignore
            id: idsArray[index].id,
            gridSize: item[0]?.gridSize,
            pageNumber: pages.pageNumber
          }
        )
      })

      const gridArray = pageNumbers.map((pages: { wordMazeArray: { [x: string]: string; }; pageNumber: string | number; }, index: string | number) => {
        // @ts-ignore
        const gridWords = generateWordSearch(idsArray[index].id, 0, pages.wordMazeArray[indx], item[0]?.gridSize, textAreaText)
        // @ts-ignore
        pages.error = Boolean(!gridWords?.answers)

        return ([
          {
            // @ts-ignore
            id: idsArray[index].id,
            grid: gridWords?.grid ?? [],
            answerList: gridWords?.answers ?? [],
            pageNumber: pages.pageNumber,
            gridSize: item[0]?.gridSize,
            x: item[0]?.x,
            y: item[0]?.y,
            w: item[0]?.w,
            h: item[0]?.h,
            answerX: item[0]?.answerX,
            answerY: item[0]?.answerY,
            answerW: item[0]?.answerW,
            answerH: item[0]?.answerH,
            answerColumns: item[0]?.answerColumns,
            answerFont: item[0]?.answerFont,
            answerColor: item[0]?.answerColor,
            mazeFont: item[0]?.mazeFont,
            mazeColor: item[0]?.mazeColor,
            mazeBorderSize: item[0]?.mazeBorderSize,
            mazeBorderColor: item[0]?.mazeBorderColor,
            error: Boolean(!gridWords?.answers)
          }]
        )
      })
      return ({ gridArray, newTextArea, newGameGridSize })
    })

    const templatePageText = texts.filter((item) => item?.pageNumber === '1')

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


    const templatePageCrossword = crosswordText.filter((item) => item?.pageNumber === '1')

    // const newInputCrosswords = templatePageCrossword.map((item, index) => {
    //   const crosswordArray = pageNumbers.map((pages) => {
    //     const newId = uuids4()
    //     return (
    //       {
    //         id: newId,
    //         width: item.w,
    //         value: pages?.text?.length ? pages.text[index] : item.value,
    //         font: item.mazeFont,
    //         color: item.mazeColor,
    //         pageNumber: pages.pageNumber
    //       }
    //     )
    //   })
    //   return (crosswordArray.flat())
    // })


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
    // const gameGridSizeFromProps = newPageGridWithProps.map(({ newGameGridSize }) => newGameGridSize)
    // // @ts-ignore
    // setGameGridSize([...gameGridSize, ...gameGridSizeFromProps.flat() ?? []])
    //  @ts-ignore
    setTextAreaText([...textFromProps.flat() ?? []])
    setTexts([...newInputTexts.flat() ?? []])
    setImagesDragged([...imagesDragged, ...newImagesDragged.flat() ?? []])
    // @ts-ignore
    setCreateGridWithProps([
      ...gridFromProps.flat() ?? []
    ])

    // setGamGridSize([...gameGridSize, ...gameGridSizeFromProps.flat() ?? []])
    setPages(newPages)
  }

  interface addTemplatePageProps {
    text?: any
    wordMazeArray?: any
    images?: any
    crosswords?: any
  }

  // @ts-ignore
  const addTemplatePage: addTemplatePageProps = ({ text, wordMazeArray, images = [], crosswords = [] }) => {
    const isEmptyPage = (texts.length === 0 && createGridWithProps.length === 0 && images.length === 0 && crosswords.length === 0) ? true : false
    const nextPageNumber = isEmptyPage ? currentPage : (pages.length + 1).toString()

    const newTexts = [...texts]
    if (text) {
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
            pageNumber: nextPageNumber
          }
        )
      })
    }
    // @ts-ignore
    const [...newGameGridSize] = wordMazeArray ? wordMazeArray?.map((item) => {
      return (
        {
          id: item.id,
          gridSize: item.gridSize,
          pageNumber: nextPageNumber,
        })
    }) : []

    // @ts-ignore
    const [...newTextArea] = wordMazeArray ? wordMazeArray?.map((item) => {
      return (
        {
          id: item.id,
          value: item.answerArray,
          pageNumber: nextPageNumber,
          answerColumns: item.answerColumns ?? 1,
          answerFont: item.answerFont ?? 'Roboto',
          answerColor: item.answerColor ?? '#000000',
          mazeBorderSize: item.mazeBorderSize ?? 2,
          mazeBorderColor: item.mazeBorderColor ?? 'red',
          mazeFont: item.mazeFont ?? 'Roboto',
          mazeColor: item.mazeColor ?? '#000000'
        })
    }) : []

    // @ts-ignore
    const [...newPageGridWithProps] = wordMazeArray ? wordMazeArray?.map((item) => {
      const mazeData = generateWordSearch(item.id, 0, item.answerArray, 10, newTextArea)
      return ([{
        id: item.id,
        grid: mazeData?.grid ?? [],
        answerList: mazeData?.answers ?? [],
        pageNumber: nextPageNumber,
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
    }) : []

    if (wordMazeArray) {

      setGamGridSize([...gameGridSize, ...newGameGridSize])
      setTextAreaText([...textAreaText, ...newTextArea])
      setCreateGridWithProps([...createGridWithProps, ...newPageGridWithProps])
    }
    // }
    text && setTexts(newTexts)


    const newImages = images?.map((img) => {
      if (!img) {
        return [];
      }

      return {
        // @ts-ignore
        ...img,
        id: uuids4(),
        pageNumber: nextPageNumber,
      }
    })

    newImages?.length && setImagesDragged([...images, ...newImages])

    const newCrosswords = crosswords?.map((crossword) => {
      return {
        // @ts-ignore
        ...crossword,
        id: uuids4(),
        pageNumber: nextPageNumber,
      }
    })

    newCrosswords?.length && setCrosswordText([...crosswords, ...newCrosswords])

    const pagesToShow = isEmptyPage ? pages.filter(({ pageNumber }) => pageNumber !== currentPage) : pages;

    const newPages = [
      ...pagesToShow,
      {
        pageNumber: nextPageNumber,
        wordMazeArray: wordMazeArray ? newPageGridWithProps : [],
        text: text ? newTexts.filter(({ pageNumber }) => pageNumber === nextPageNumber) : [],
        image: [...newImages]
      }
    ]

    setPages(newPages)
    setCurrentPage(nextPageNumber)
  }

  useEffect(() => {
    // setImagesDragged(newImages)
    const newImages = [...imagesDragged]

    const newPages = pages.map((item) => {
      const img = newImages.filter((props) => props?.pageNumber === item.pageNumber)
      return { ...item, image: img }
    })
    setPages(newPages)
  }, [imagesDragged])

  const [selectedAccordion, setSelectedAccordion] = useState('')
  const [imageGenerating, setImageGenerating] = useState(false)
  const [imageTheme, setImageTheme] = useState('')
  const [imageCategory, setImageCategory] = useState('adult')

  return (
    <>
      <Script id="tawk-script" strategy="lazyOnload">
        {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/69418f2c4f7afe19760b611e/1jck1ehc3';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
      </Script>
      {contentLoading &&
        <Box sx={{
          position: 'absolute',
          backgroundColor: '#787878',
          opacity: 0.99,
          width: '100%',
          height: '100%',
          zIndex: 2000,

        }}>
          <Box sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>

            <div className={styles.loader}></div>
          </Box>
        </Box>
      }
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid container sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', height: "100%" }} className={styles.main2}>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Grid className={styles.main} sx={{ width: '100%' }} >
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
                      {Logo}
                    </div>
                  </Box>
                  <List sx={{ paddingTop: 0 }}>
                    {[
                      { text: 'Project', value: 'page', icon: <DescriptionIcon /> },
                      { text: 'Texts', value: 'texts', icon: <TextFieldsIcon /> },
                      { text: 'Images', value: 'images', icon: <ImageIcon /> },
                      { text: 'Word mazes', value: 'maze', icon: <GridViewIcon /> },
                      { text: 'Crossword puzzles', value: 'crossword', icon: <GridViewIcon /> }
                    ].map(({ text, icon, value }) => (
                      <ListItem key={text} disablePadding>
                        <ListItemButton
                          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', '&.Mui-selected': { backgroundColor: '#ffff47' } }}
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
                </Box>
              </Drawer>
              <Box component="main" sx={{
                flexGrow: 1,
                pr: 1,
                minWidth: '550px',
                height: '100vh',
                overflowY: 'scroll'
              }}>

                {/* Token counter */}

                {/* <Box sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '10px',
                  background: '#f5f5f5',f
                  padding: '10px',
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
                }}>
                  <Box sx={{ display: 'flex', background: '#a54efc', borderRadius: '5px', padding: '10px 20px', }}>
                    <AutoAwesomeIcon sx={{ marginRight: '5px' }} />
                    <Typography sx={{ color: 'white', textAlign: 'right' }}>Tokens: {tokenBalance}</Typography>
                  </Box>
                </Box> */}

                <Box sx={{ pl: 3 }}>

                  {openedToolPage === 'page' &&
                    <>
                      <Box sx={{ mb: '1rem', mt: '1rem', }}>
                        <FormControl>
                          <FormLabel id="demo-row-radio-buttons-group-label" sx={{ color: 'grey' }}>Projects</FormLabel>
                          <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={selectedProject}
                            onChange={(e) => {
                              // @ts-ignore
                              setSelectedProject(e.target.value)
                              setCurrentPage('1')
                            }}
                          >
                            {projects?.map(({ name, id }, index) =>
                              <FormControlLabel
                                sx={{
                                  color: 'grey',
                                  width: '160px',
                                  height: '80px',
                                  margin: '10px',
                                  textAlign: 'center',
                                  borderRadius: '10px',
                                  background: 'white',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  '.MuiFormControlLabel-label': {
                                    marginTop: '10px',
                                    marginLeft: '10px'
                                  },
                                }}
                                key={index}
                                value={id}
                                control={
                                  <Radio
                                    checkedIcon={<BookmarkIcon sx={{ color: '#fcd0f4' }} />}
                                    icon={<BookmarkIcon sx={{ color: 'rgba(189, 189, 189, 1)' }} />}
                                    sx={{
                                      color: 'grey',
                                      '&.Mui-checked': {
                                        color: 'grey',
                                      },
                                    }}
                                  />
                                }
                                onChange={() => handleProject(id)}
                                label={name}
                                labelPlacement="start"
                              />
                            )}

                          </RadioGroup>
                        </FormControl>
                      </Box>

                      <Button
                        variant='contained'
                        onClick={() =>
                          setOpenCreateProject(true)
                        }
                        size='small'
                        startIcon={<AddIcon />}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#fcd0f4',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '10px 24px',
                            marginRight: '20px'
                          }
                        }}
                      >
                        Create project
                      </Button>
                      <Modal
                        open={openCreateProject}
                        onClose={() => setOpenCreateProject(false)}
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
                            color: 'grey',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '20px'
                          }}>
                          <Box>
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
                          <Box>
                            <FormLabel sx={{ display: 'block', marginBottom: '10px' }}>Project name</FormLabel>
                            <TextField sx={{ width: '50%' }} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                          </Box>
                          <Box>
                            <Button variant="outlined" onClick={createProjectHandler}>Create project</Button>
                          </Box>
                          <IconButton
                            sx={{ position: 'absolute', right: '0', top: '0', padding: 0 }}
                            onClick={() => {
                              setOpenCreateProject(false)
                            }}>
                            <HighlightOffIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      </Modal>

                      <Box sx={{ marginTop: '10px', marginBottom: '20px' }}>
                        <FormLabel sx={{ display: 'block', marginBottom: '10px' }}>Templates</FormLabel>
                        <Button
                          variant='contained'
                          onClick={() => {
                            setPages([...pages, { pageNumber: (pages.length + 1).toString() }])
                            setCurrentPage((pages.length + 1).toString())
                          }}
                          size='small'
                          // startIcon={<AddIcon />}
                          sx={{
                            '&.MuiButton-contained': {
                              backgroundColor: 'white',
                              color: 'grey',
                              borderRadius: '10px',
                              width: '140px',
                              height: '200px',
                              margin: '6px 8px',
                            }
                          }}
                        >
                          <Box>
                            <p>Add blank page</p>
                            <AddIcon />
                          </Box>
                        </Button>
                        <Button
                          variant='contained'
                          disabled={
                            // @ts-ignore
                            pages[0].text?.length === 0 &&
                            // @ts-ignore
                            pages[0].crossword?.length === 0 &&
                            // @ts-ignore
                            pages[0].image?.length === 0 &&
                            // @ts-ignore
                            pages[0].wordMazeArray[0]?.length === 0
                          }
                          onClick={() => {
                            // @ts-ignore
                            const mazes = pages[0]?.wordMazeArray[0].length && pages[0]?.wordMazeArray?.map((mazeItems, index) => {
                              return ({
                                ...mazeItems[0],
                                id: uuids4(),
                                answerArray: textAreaText[index]?.value
                              })
                            })
// @ts-ignore
                            const texts = pages[0]?.text.map((txt) => {
                              return (
                                {
                                  ...txt,
                                  id: uuids4()
                                }
                              )
                            })
// @ts-ignore
                            addTemplatePage({
                              wordMazeArray: mazes && mazes?.flat(),
                              text: texts && texts?.flat(),
                              // @ts-ignore
                              images: pages[0]?.image,
                              // @ts-ignore
                              crosswords: pages[0]?.crossword
                            })
                            setCurrentPage((pages.length + 1).toString())
                          }}
                          size='small'
                          sx={{
                            '&.MuiButton-contained': {
                              backgroundColor: 'white',
                              color: 'grey',
                              borderRadius: '10px',
                              width: '140px',
                              height: '200px',
                              margin: '6px 8px',
                            }
                          }}
                        >
                          <Box>
                            <p>Copy current page</p>
                            <ContentCopyIcon />
                          </Box>
                        </Button>
                        <Button onClick={() => {
                          // @ts-ignore
                          addTemplatePage(firstTemplate(pdfPreviewHeight, pdfSize))
                        }}>
                          <img
                            src={'/template_1.png'}
                            alt=""
                            draggable="true"
                            style={{
                              borderRadius: '10px', maxWidth: '200px', maxHeight: '200px',
                              boxShadow: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)'
                            }}
                          />
                        </Button>
                        <Button onClick={() => {
                          // @ts-ignore
                          addTemplatePage(secondTemplate(pdfPreviewHeight, pdfSize))
                        }}>
                          <img
                            src={'/template_2.png'}
                            alt=""
                            draggable="true"
                            style={{
                              borderRadius: '10px', maxWidth: '200px', maxHeight: '200px',
                              boxShadow: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)'
                            }}
                          />
                        </Button>
                        <Button onClick={() => {
                          // @ts-ignore
                          addTemplatePage(thirdTemplate(pdfPreviewHeight, pdfSize))
                        }}>
                          <img
                            src={'/template_3.png'}
                            alt=""
                            draggable="true"
                            style={{
                              borderRadius: '10px', maxWidth: '200px', maxHeight: '200px',
                              boxShadow: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)'
                            }}
                          />
                        </Button>
                      </Box>
                      {/* <Button
                        variant='contained'
                        onClick={() => {

                          setPages([...pages, { pageNumber: (pages.length + 1).toString() }])
                          setCurrentPage((pages.length + 1).toString())
                        }}
                        size='small'
                        startIcon={<AddIcon />}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#fcd0f4',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '10px 24px',
                            marginRight: '20px'
                          }
                        }}
                      >
                        Add page
                      </Button> */}

                      {/* Hide generate with AI for now */}
                      {/* <Button
                        variant='contained'
                        onClick={() => setOpenBulkPageModal(true)}
                        size='small'
                        startIcon={<AutoAwesomeIcon />}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#a54efc',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '10px 24px',
                          }
                        }}
                      >
                        Generate with AI
                      </Button> */}
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
                                      {texts.filter((item) => item?.pageNumber === page.pageNumber).map(({ value, id }, index) => (
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
                                          {createGridWithProps.find((item) => item[0]?.id === id && item[0]?.error === true) &&
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
                                    item[0]?.gridSize - 2).join(' and ')} words highly relevant to the book's theme.

                                Critical Constraints:

                                Every word in the word list MUST NOT exceed ${createGridWithProps.map((item) => item[0]?.gridSize).join(' and ')} characters in length.

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

                                  return geminiAiCallWithTracking(descriptionBase, activeUser.current, setTokenBalance).then((response) => {
                                    // @ts-ignore
                                    const pageArray: any[] | PromiseLike<any[]> = [];
                                    // @ts-ignore
                                    response.data.map((item, index) => {
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
                        {texts.filter((item) => item?.pageNumber === currentPage).map(({ value, id }, index) => {
                          return (
                            <Accordion
                              expanded={id === selectedAccordion}
                              onChange={() => selectedAccordion === id ? setSelectedAccordion('') : setSelectedAccordion(id)}
                              key={id}
                            >
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
                                                value={texts.find((item) => item?.id === id)?.align}
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
                                        <DeleteForeverIcon fontSize='small' />
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
                              padding: '10px 24px',
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
                      <Box sx={{ mb: '1rem', mt: '1rem', width: '100%' }}>
                        {/* <Box sx={{ marginBottom: '20px' }}>
                          <Textarea
                            minRows={2}
                            size="md"
                            className={styles.text_input_maze}
                            placeholder='Describe image you want'
                            // @ts-ignore
                            onChange={(e) => setImageTheme(e.target.value)}
                            value={imageTheme}
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
                                    value={imageCategory}
                                    onChange={(e) => setImageCategory(e.target.value)}
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
                                        // fontFamily: `${texts.find((item) => item.id === id)?.align}`,
                                      }
                                    }}
                                  >
                                    <MenuItem value={'adult'}>Adult coloring book</MenuItem>
                                    <MenuItem value={'children'}>Children coloring book</MenuItem>
                                    <MenuItem value={'other'}>Its up to you</MenuItem>
                                  </Select>

                                </Box>
                                <Button
                                  variant='contained'
                                  size='small'
                                  startIcon={<AutoAwesomeIcon />}
                                  sx={{
                                    '&.MuiButton-contained': {
                                      backgroundColor: '#a54efc',
                                      color: 'black',
                                      borderRadius: '25px',
                                      padding: '10px 24px',
                                    }
                                  }}
                                  onClick={() => {
                                    setImageGenerating(true)
                                    const adultColoringBookPrompt = `Adult coloring book page, high detail, intricate patterns, line art only, thick black lines, no shading, no color, symmetrical/asymmetrical composition, white background. Theme: ${imageTheme}`
                                    const childrenColoringBookPrompt = `Children coloring book page. Theme: ${imageTheme}. Black and white line art, thick and clean outlines, no shading, no color, and no grayscale.`

                                    const prompt = () => {
                                      switch (imageCategory) {
                                        case "adult":
                                          return adultColoringBookPrompt
                                        case "children":
                                          return childrenColoringBookPrompt
                                        case "other":
                                          return imageTheme
                                        default:
                                          return imageTheme;
                                      }

                                    }

                                    geminiImageAiCallWithTracking(prompt(), activeUser.current, setTokenBalance).then((response) => {

                                      // if (response?.aiQuestion) {
                                      //   setAiQuestion(response?.aiQuestion)
                                      // }

                                      const imageFile = new File([response?.data.blob], 'AiImage', { lastModified: new Date().getTime(), type: 'image/png' })
                                      const newImageList = images ? [...images?.imageList] : []
                                      const newImagesUpdateIndexes = images && images?.addUpdateIndex ? [...images?.addUpdateIndex] : []
                                      const imageListElements = [...newImageList, { dataURL: `data:image/png;base64,${response?.data.imageData}`, file: imageFile }]
                                      // @ts-ignore
                                      imageListElements.map(async ({ dataURL, file }) => await getImageDimensions(dataURL ?? '').then(({ w, h }) => {
                                        const imageWidth = w > pdfSize[0] ? w * (pdfSize[0] / w) : w
                                        const imageHeight = w > pdfSize[0] ? h * (pdfSize[0] / w) : h
                                        file && Object.assign(file, { dimensions: [imageWidth, imageHeight] })

                                        setImages({ imageList: imageListElements, addUpdateIndex: [...newImagesUpdateIndexes, 1] })

                                      }))
                                      setImageGenerating(false)
                                    }).catch((error) => {
                                      setImageGenerating(false)
                                      console.error(error)
                                    })
                                  }}
                                >
                                  {imageGenerating ? '...Generating' : 'GenerateImage'}
                                </Button>
                              </Box>
                            }
                          />
                        </Box> */}

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
                                    padding: '10px 24px',
                                  }
                                }}
                              >
                                Upload image
                              </Button>
                              <Box sx={{ maxWidth: '550px', display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
                                {imageList.map((image, index) => {
                                  return (
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

                                            const newPages = pages.map((item) => {
                                              const img = imagesDragged.filter((props) => props?.pageNumber === item.pageNumber)
                                              return { ...item, image: img }
                                            })

                                            setPages(newPages)

                                            setImagesDragged(newSelectedImage)
                                            setSelectedImageId(null)
                                          } else {
                                            const newImages = [...imagesDragged]
                                            newImages.push(
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
                                            )
                                            setImagesDragged(newImages)

                                            const newPages = pages.map((item) => {
                                              const img = newImages.filter((props) => props?.pageNumber === item.pageNumber)
                                              return { ...item, image: img }
                                            })

                                            setPages(newPages)
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
                                                    const newImages = [...imagesDragged]
                                                    newImages.push(
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
                                                    )

                                                    setImagesDragged(newImages)

                                                    const newPages = pages.map((item) => {
                                                      const img = newImages.filter((props) => props?.pageNumber === item.pageNumber)
                                                      return { ...item, image: img }
                                                    })

                                                    setPages(newPages)
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

                                  )
                                })}
                              </Box>
                            </Box>
                          )}
                        </ImageUploading>
                      </Box>
                    </>
                  }
                  {openedToolPage === 'maze' &&
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid grey', width: '100%', mb: '1rem', mt: '1rem', }}>
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

                          <Accordion
                            expanded={id === selectedAccordion}
                            onChange={() => selectedAccordion === id ? setSelectedAccordion('') : setSelectedAccordion(id)}
                            key={id}
                          >
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
                                  <Box sx={{ marginTop: '20px' }}>
                                    <Accordion
                                      // expanded={id === selectedAccordion}
                                      // onChange={() => selectedAccordion === id ? setSelectedAccordion('') : setSelectedAccordion(id)}
                                      key={id}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                      >
                                        <Typography component="span">Maze letters</Typography>
                                      </AccordionSummary>
                                      <AccordionDetails>

                                        <TextField
                                          sx={{ width: '100%' }}
                                          type='string'
                                          // value={randomLetterList}
                                          // onChange={(e) => setRandomLetterList(e.target.value)}

                                          value={textAreaText.find((item) => item.id === id)?.randomLetterList}
                                          onChange={(e) => handleMazeRandomLetterList(e.target.value, id)}
                                        />

                                      </AccordionDetails>
                                    </Accordion>
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
                                  <DeleteForeverIcon fontSize='small' />
                                </IconButton>
                              </Box>
                            </AccordionDetails>
                          </Accordion>

                        )}
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => addNewMazeTextField(currentPage)}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#fcd0f4',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '10px 24px',
                          }
                        }}
                      >
                        Add new maze
                      </Button>
                    </>
                  }
                  {openedToolPage === 'crossword' &&
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid grey', width: '100%', mb: '1rem', mt: '1rem', }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: 'gray' }}> Show answers</Typography>
                          <Switch
                            checked={openCrosswordAnswerMarkers}
                            onChange={() => setOpenCrosswordAnswerMarkers(!openCrosswordAnswerMarkers)}
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
                        {crosswordText.filter((item) => item.pageNumber === currentPage).map(({ id, value, pageNumber }, index) =>
                          <Accordion
                            expanded={id === selectedAccordion}
                            onChange={() => selectedAccordion === id ? setSelectedAccordion('') : setSelectedAccordion(id)}
                            key={id}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1-content"
                              id="panel1-header"
                            >
                              <Typography component="span">Crossword {index + 1}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box key={index} sx={{ position: 'relative', pt: '20px', paddingRight: '20px', marginBottom: '20px' }}>
                                <Box>
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
                                        value={crosswordText?.find((item) => item.id === id).mazeBorderSize}
                                        // @ts-ignore
                                        onChange={handleCrosswordBorderSize}
                                      // label="Maze border size"
                                      />
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: 'grey', fontSize: '14px' }}>Maze border color</Typography>
                                      {/* @ts-ignore */}
                                      <ColorPicker
                                      // @ts-ignore
                                        color={crosswordText.find((item) => item.id === id)?.mazeBorderColor}
                                        onChange={(color) => handleCrosswordBorderColor(color, id)
                                        } />
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
                                      handleCrosswordTextInput(newValue, id);
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
                                        handleCrosswordTextInput(combinedValues, id);
                                      }
                                    }}
                                    renderTags={(value) => {
                                      return (
                                        value.map((option, index) => (
                                          <Chip
                                            key={index}
                                            label={option}
                                            onDelete={(e) => {
                                              const newTexts = [...crosswordText];
                                              // const foundText = textAreaText.find((item) => item.id === id);
                                              // if (foundText) {
                                              //   foundText.value.splice(index, 1);
                                              // }
                                              const newValue = [...value];
                                              newValue.splice(index, 1);
                                              setCrosswordText(newTexts);

                                              // Also update the component's value state
                                              handleCrosswordTextInput(newValue, id);
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


                                </Box>
                                <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', marginBottom: ' 10px' }}>
                                  <Button
                                    variant="contained"
                                    onClick={() => {

                                      crosswordText
                                      const grid = generateCrossword(value);
                                      const newCrossword = [...crosswordText]
                                      const foundText = crosswordText.find((item) => item.id === id);
                                      if (foundText) {
                                        foundText.grid = grid
                                      }

                                      foundText && setCrosswordText(newCrossword)

                                      const newPages = pages.map((item) => {
                                        const crossword = newCrossword.filter(({ pageNumber }) => pageNumber === item.pageNumber)

                                        return { ...item, crossword: crossword }
                                      })

                                      setPages(newPages)
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
                                    Generate Crossword
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
                                    handleCrosswordDelete(id)
                                  }}>
                                  <DeleteForeverIcon fontSize='small' />
                                </IconButton>
                              </Box>
                            </AccordionDetails>
                          </Accordion>

                        )}
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => addNewCrosswordTextField(currentPage)}
                        sx={{
                          '&.MuiButton-contained': {
                            backgroundColor: '#fcd0f4',
                            color: 'black',
                            borderRadius: '25px',
                            padding: '10px 24px',
                          }
                        }}
                      >
                        Add new crossword puzzle
                      </Button>
                    </>
                  }
                </Box>
              </Box>
            </Box>
          </Grid>

        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6}>
          <Grid
            // container
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
                    page={parseInt(currentPage)}
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
                      height: pdfPreviewHeight,
                      fileName: selectedProjectName.current,
                      crosswordPuzzles: crosswordText
                    }
                  )}
                  sx={{
                    '&.MuiButton-contained': {
                      backgroundColor: '#FFFF48',
                      color: 'rgb(0 0 0 / 75%);',
                      borderRadius: '5px',
                      padding: '15px 20px',
                      height: '40px'
                    }
                  }}
                >
                  <PictureAsPdfIcon sx={{ marginRight: '5px' }} />
                  Download
                </Button>

                <Button sx={{ color: 'black' }} onClick={saveProject}>
                  {saveLoad ?
                    "Saving..."
                    : "Save"
                  }
                </Button>
              </Box>
              <Paper
                createGrid={createGridWithProps}
                setCreateGridWithProps={setCreateGridWithProps}
                width={pdfPreviewHeight * (pageSize.current[0] / pageSize.current[1])}
                height={pdfPreviewHeight}
                texts={texts}
                setTexts={setTexts}
                showAnswers={openAnswerMarkers}
                showAnswerList={showAnswerList}
                images={imagesDragged}
                setImages={setImagesDragged}
                ref={stageRef}
                currentPage={currentPage}
                isImageSelected={selectedImageId ? true : false}
                selectImage={(id: string) => {
                  setSelectedImageId(id)
                }}
                pages={pages}
                setSelectedAccordion={setSelectedAccordion}
                setOpenedToolPage={setOpenedToolPage}
                setCrosswordText={setCrosswordText}
                crosswordText={crosswordText}
                openCrosswordAnswerMarkers={openCrosswordAnswerMarkers}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

