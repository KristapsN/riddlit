type Draw = {
  ctx: CanvasRenderingContext2D
  currentPoint: Point
  prevPoint: Point | null
}

type DrawMaze = {
  ctx: CanvasRenderingContext2D
}

type Point = { x: number, y: number }

type ImageSizeType = { w: number, h: number}
