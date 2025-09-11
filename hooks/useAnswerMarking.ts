import { GridCellProps } from "@/helpers/generateGrid"
import { useRef } from "react"

export const useAnswerMarking = () => {
  const answerCanvasRef = useRef<HTMLCanvasElement>(null)

  const createAnswerMarkers = (rawAnswerArray: GridCellProps[][], height: number, width: number, open: boolean) => {
    const canvas = answerCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.reset()
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = "red";

    if (open) {
      const referenceSquareSize = (width - width / 5) / 10
      const answerMarkerSpacing = referenceSquareSize / 8
      const referenceSquareDiagonalSizes = Math.sqrt(2 * Math.pow(referenceSquareSize, 2))

      rawAnswerArray.map((rawAnswers) => {
        const startCoordinatesX = (width - referenceSquareSize * 10) / 2
        const startCoordinatesY = rawAnswers[0].y / 10 * referenceSquareSize + height / 6
        const answerLength = (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10
        const answerHeight = (rawAnswers[rawAnswers.length - 1].y - rawAnswers[0].y + 10) / 10

        if (answerLength === rawAnswers.length && answerHeight === 1) {

          ctx.roundRect(
            startCoordinatesX + (rawAnswers[0].x / 10) * referenceSquareSize + answerMarkerSpacing,
            startCoordinatesY + answerMarkerSpacing,
            (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * referenceSquareSize - answerMarkerSpacing * 2,
            referenceSquareSize - answerMarkerSpacing * 2,
            [40]
          )
        }

        if (answerLength === 1 && answerHeight === rawAnswers.length) {
          ctx.roundRect(
            startCoordinatesX + (rawAnswers[0].x / 10) * referenceSquareSize + answerMarkerSpacing,
            startCoordinatesY + answerMarkerSpacing,
            referenceSquareSize - answerMarkerSpacing * 2,
            (rawAnswers[rawAnswers.length - 1].y - rawAnswers[0].y + 10) / 10 * referenceSquareSize - answerMarkerSpacing * 2,
            [40]
          )
        }
        if (answerLength !== 1 && answerHeight !== 1 && rawAnswers[0].y < rawAnswers[rawAnswers.length - 1].y) {
          ctx.translate(
            (startCoordinatesX + (rawAnswers[0].x / 10) * referenceSquareSize) + referenceSquareSize / 2,
            startCoordinatesY,
          )
          ctx.rotate((45 * Math.PI) / 180)
          ctx.roundRect(
            0,
            0,
            (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * referenceSquareDiagonalSizes - (referenceSquareSize / 2 + answerMarkerSpacing),
            referenceSquareSize - answerMarkerSpacing * 2,
            [40]
          )
          ctx.rotate((-45 * Math.PI) / 180)
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        if (answerLength !== 1 && answerHeight !== 1 && rawAnswers[0].y > rawAnswers[rawAnswers.length - 1].y) {
          ctx.translate(
            (startCoordinatesX + (rawAnswers[0].x / 10) * referenceSquareSize),
            startCoordinatesY + referenceSquareSize / 2,
          )
          ctx.rotate((-45 * Math.PI) / 180)
          ctx.roundRect(
            0,
            0,
            (rawAnswers[rawAnswers.length - 1].x - rawAnswers[0].x + 10) / 10 * referenceSquareDiagonalSizes - (referenceSquareSize / 2 + answerMarkerSpacing),
            referenceSquareSize - answerMarkerSpacing * 2,
            [40]
          )
          ctx.rotate((45 * Math.PI) / 180)
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }

        ctx.stroke();
      })
    }
  }

  return { answerCanvasRef, createAnswerMarkers }
}
