interface Color {
  R: number
  G: number
  B: number
}

interface Point {
  X: number
  Y: number
}

interface Rect {
  Min: Point
  Max: Point
}

interface Block {
  Idx: number
  Filled: boolean
  Rect: Rect
}

interface BlockImage {
  W: number
  H: number
  BlockSize: number
  Palette: Color[]
  Grid: Block[][]
  Font: string
}

class Image implements BlockImage {
  public constructor() {
    this.W = 0;
    this.H = 0;
    this.BlockSize = 0;
    this.Palette = Array<Color>();
    this.Grid = Array<Array<Block>>();
    this.Font = "";
  }
  W: number
  H: number
  BlockSize: number
  Palette: Color[]
  Grid: Block[][]
  Font: string
}

export { Color, Point, Rect, Block, BlockImage, Image }
