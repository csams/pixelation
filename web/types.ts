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
    Color?: string
}

interface BlockImage {
    W: number
    H: number
    BlockSize: number
    Palette: Color[]
    Grid: Block[][]
    Font?: string
}

export {Color, Point, Rect, Block, BlockImage}
