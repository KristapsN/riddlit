import jsPDF from "jspdf"
import { ComicRelief, Delius, DeliusUnicase, DynaPuff, EmilysCandy, MeowScript, Pacifico, Roboto, OpenSans } from "../fonts/pdfFonts/AllFonts"
import { GridWithPropsProps, ImageDraggedProps, PageElementProps, TextsProps } from "@/app/protected/page"
import { getColumnIndices } from "./getColumnIndices"

interface ExportProps {
  width: number
  height: number
  texts: TextsProps[]
  createGrid: GridWithPropsProps[][]
  showAnswerList: boolean
  images: ImageDraggedProps[]
  pdfSize: number[]
  pages: PageElementProps[]
}

export const handleExport = ({ pdfSize, pages, createGrid, images, showAnswerList, texts, width, height }: ExportProps) => {
  const pdf = new jsPDF({
    format: [pdfSize[0], pdfSize[1]],
    unit: 'px',
    // lineHeight: 1.25,
  });

  for (let i = 0; i < pages.length - 1; i++) {
    pdf.addPage()
  }

  pdf.addFileToVFS('Pacifico-Regular-normal.ttf', Pacifico);
  pdf.addFont('Pacifico-Regular-normal.ttf', 'Pacifico', 'normal');
  pdf.addFileToVFS('MeowScript-Regular-normal.ttf', MeowScript);
  pdf.addFont('MeowScript-Regular-normal.ttf', 'Meow Script', 'normal');
  pdf.addFileToVFS('EmilysCandy-Regular-normal.ttf', EmilysCandy);
  pdf.addFont('EmilysCandy-Regular-normal.ttf', 'Emilys Candy', 'normal');
  pdf.addFileToVFS('DynaPuff-VariableFont_wdth,wght-normal.ttf', DynaPuff);
  pdf.addFont('DynaPuff-VariableFont_wdth,wght-normal.ttf', 'DynaPuff', 'normal');
  pdf.addFileToVFS('DeliusUnicase-Regular-normal.ttf', DeliusUnicase);
  pdf.addFont('DeliusUnicase-Regular-normal.ttf', "Delius Unicase", 'normal');
  pdf.addFileToVFS('Delius-Regular-normal.ttf', Delius);
  pdf.addFont('Delius-Regular-normal.ttf', 'Delius', 'normal');
  pdf.addFileToVFS('ComicRelief-Regular-normal.ttf', ComicRelief);
  pdf.addFont('ComicRelief-Regular-normal.ttf', 'Comic Relief', 'normal');
  pdf.addFileToVFS('Roboto-VariableFont_wdth,wght-normal.ttf', Roboto);
  pdf.addFont('Roboto-VariableFont_wdth,wght-normal.ttf', 'Roboto', 'normal');
  pdf.addFileToVFS('OpenSans-VariableFont_wdth,wght-normal.ttf', OpenSans);
  pdf.addFont('OpenSans-VariableFont_wdth,wght-normal.ttf', 'Open Sans', 'normal');

  const context = pdf.context2d;

  const widthDifference = pdfSize[0] / width
  const heightDifference = pdfSize[1] / height

  createGrid.map((grid) => {
    pdf.setPage(parseInt(grid[0].pageNumber))
    pdf.setLineWidth(grid[0].mazeBorderSize);
    // @ts-ignore
    const currentSquareWidth = grid[0].w / grid[0].gridSize * widthDifference
    // @ts-ignore
    const currentSquareHeight = grid[0].h / grid[0].gridSize * heightDifference

    grid[0].grid.map(({ x, y, letter }) => {
      const startCoordinatesX = (x / 10) * currentSquareWidth
      const startCoordinatesY = (y / 10) * currentSquareWidth

      pdf.setDrawColor(grid[0].mazeBorderColor)
      pdf.setFont(grid[0].mazeFont)
      pdf.rect(
        (grid[0].x * widthDifference + startCoordinatesX),
        (grid[0].y * heightDifference + startCoordinatesY),
        currentSquareWidth,
        currentSquareHeight,
      )
      pdf.setFontSize(currentSquareWidth * 0.6 / 0.75)
      pdf.setTextColor(grid[0].mazeColor)
      pdf.text(letter,
        // @ts-ignore
        ((grid[0].x * widthDifference) + startCoordinatesX + currentSquareWidth / 2 - context.measureText(letter).width / 4),
        ((grid[0].y * heightDifference) + startCoordinatesY + currentSquareHeight / 2 + (currentSquareHeight / 5)),
      )
    })

    if (showAnswerList) {

      const answerList = grid[0].answerList.map(
        (item: { letter: any }[]) => item.map(({ letter }) => letter).join('')
      )

      const breakpoints = getColumnIndices(answerList, grid[0].answerColumns)
      let xPosition = 0
      let yPosition = -1
      let currentBreakpoint = 1

      answerList.map((answer, index) => {
        yPosition += 1
        if (breakpoints[currentBreakpoint] === index) {
          yPosition = 0
          xPosition += grid[0].answerW / grid[0].answerColumns
          currentBreakpoint += 1
          if (breakpoints.length === currentBreakpoint) {
            currentBreakpoint -= 1
          }
        }
        pdf.setLineWidth(2);
        pdf.setDrawColor(grid[0].answerColor)
        pdf.rect(
          grid[0].answerX * widthDifference + xPosition,
          ((grid[0].answerY * heightDifference) + (yPosition) * (grid[0].answerH * heightDifference) / grid[0].answerList.length),
          (grid[0].answerH * heightDifference / grid[0].answerList.length - 10),
          (grid[0].answerH * heightDifference / grid[0].answerList.length - 10)
        )
        pdf.setFont(grid[0].answerFont)
        const fontSize = grid[0].answerH * heightDifference / answerList.length - 10

        pdf.setTextColor(grid[0].answerColor)
        pdf.setFontSize(fontSize / 0.75)
        pdf.text(answer,
          (grid[0].answerX * widthDifference + (grid[0].answerH * heightDifference) / answerList.length + xPosition),
          ((grid[0].answerY * heightDifference) + (yPosition) * (grid[0].answerH * heightDifference) / answerList.length + (fontSize * 0.8)),
        );
      })
    }
  })
  console.log('getLayers', texts)

  texts.map((text) => {
    pdf.setPage(parseInt(text.pageNumber))
    const size = text.size / 0.75; // convert pixels to points
    pdf.setFontSize(size);

    pdf.setFont("Pacifico");
    pdf.setFont("Meow Script");
    pdf.setFont("Emilys Candy");
    pdf.setFont("DynaPuff")
    pdf.setFont("Delius Unicase")
    pdf.setFont("Delius")
    pdf.setFont("Comic Relief")
    pdf.setFont("Roboto")
    pdf.setFont("Open Sans")

    pdf.setTextColor(text.color)
    pdf.setFont(text.font)
    pdf.text(
      text.value,
      text.initialPosition.x * widthDifference,
      text.initialPosition.y * heightDifference,
      {
        baseline: 'top',
        maxWidth: text.width
        // angle: -text.getAbsoluteRotation(),
      });
  });

  images.map(({ x, y, src, w, h, pageNumber }) => {
    pdf.setPage(parseInt(pageNumber))
    pdf.addImage(
      // @ts-ignore
      src,
      'png',
      x * widthDifference,
      y * heightDifference,
      w * widthDifference,
      h * heightDifference
    )
  })

  pdf.save("word_maze.pdf");
};