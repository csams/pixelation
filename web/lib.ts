
var blockImage: BlockImage;
var down = false;

class Color {
    R: number
    G: number
    B: number
}

class Point {
    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }
    X: number
    Y: number
}

class Rect {
    Min: Point
    Max: Point
}

class Block {
    Idx: number
    Filled: boolean
    Rect: Rect
}

class BlockImage {
    W: number
    H: number
    BlockSize: number
    Palette: Color[]
    Grid: Block[][]
}

function clear(doc: BlockImage) {
    doc.Grid.forEach(row => row.forEach(block => {
        block.Filled = false;
    }));
}

function render(image: BlockImage) {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas") as HTMLCanvasElement;
    canvas.width = image.W;
    canvas.height = image.H;
    let c = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (!c) {
        console.log("Couldn't get canvas context.");
        return;
    }

    c.clearRect(0, 0, canvas.width, canvas.height);
    image.Grid.forEach(row => row.forEach(block => {
        let p = image.Palette[block.Idx];
        let rect = block.Rect;
        let d: number = 64 / 255;
        let color: string = block.Filled ? `rgb(${p.R}, ${p.G}, ${p.B})` : "black";
        c.fillStyle = color;
        c.fillRect(rect.Min.X, rect.Min.Y, rect.Max.X - rect.Min.X, rect.Max.Y - rect.Min.Y);
    }));
}

function drawBlock(pt: Point) {
    blockImage.Grid[pt.Y][pt.X].Filled = true;
}

function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const fd = new FormData(document.querySelector("#form") as HTMLFormElement);
    fetch("/api/convert", {
        method: "post",
        body: fd
    }).then((res: Response) => {
        return res.json();
    }).then((doc: BlockImage) => {
        blockImage = doc;
        clear(blockImage);
        render(doc);
    });
}

function getGridLocation(event: MouseEvent): Point {
    var elem = document.getElementById('canvas') as HTMLCanvasElement,
        elemLeft = elem.offsetLeft + elem.clientLeft,
        elemTop = elem.offsetTop + elem.clientTop;

    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;

    x = Math.trunc(x / blockImage.BlockSize);
    y = Math.trunc(y / blockImage.BlockSize);
    return new Point(x, y);

}

function flood(pt: Point) {
    let block: Block = blockImage.Grid[pt.Y][pt.X];
    if (block.Filled){
        return;
    }
    
    block.Filled = true;
    console.log(`Flooding ${pt.X}, ${pt.Y}`);
    // fill left
    if (pt.X - 1 >= 0) {
        if (block.Idx == blockImage.Grid[pt.Y][pt.X - 1].Idx) {
            flood(new Point(pt.X - 1, pt.Y));
        }
    }

    // fill right
    if (pt.X + 1 < blockImage.Grid[pt.Y].length) {
        if (block.Idx == blockImage.Grid[pt.Y][pt.X + 1].Idx) {
            flood(new Point(pt.X + 1, pt.Y));
        }
    }

    // fill up
    if (pt.Y - 1 >= 0) {
        if (block.Idx == blockImage.Grid[pt.Y - 1][pt.X].Idx) {
            flood(new Point(pt.X, pt.Y - 1));
        }
    }

    // fill down
    if (pt.Y + 1 < blockImage.Grid.length) {
        if (block.Idx == blockImage.Grid[pt.Y + 1][pt.X].Idx) {
            flood(new Point(pt.X, pt.Y + 1));
        }
    }

}

function handleDoubleClick(event: MouseEvent) {
    event.preventDefault();
    let pt = getGridLocation(event);
    flood(pt);
    render(blockImage);
}

function handleClick(event: MouseEvent) {
    event.preventDefault();

    let pt = getGridLocation(event);

    blockImage.Grid[pt.Y][pt.X].Filled = true;
    render(blockImage);
}

function handleMouseMove(event: MouseEvent) {
    if (down) {
        event.preventDefault();

        let pt = getGridLocation(event);

        blockImage.Grid[pt.Y][pt.X].Filled = true;
        render(blockImage);
    }
}

function handleMouseDown(event: MouseEvent) {
    down = true;
}

function handleMouseUp(event: MouseEvent) {
    down = false;
}