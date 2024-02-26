interface Color {
    R: number
    G: number
    B: number
};

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
}

export {Color, Point, Rect, Block, BlockImage}
