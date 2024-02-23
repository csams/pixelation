
var blockImage: BlockImage;
var down = false;

class Color {
    R: number
    G: number
    B: number
}

class Point {
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

function drawBlock(row: number, col: number) {
    blockImage.Grid[row][col].Filled = true;
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

function handleMouseDown(event){
    down = true;
}

function handleMouseUp(event){
    down = false;
}

function handleMouseMove(event){
    if (down) {
        handleClick(event);
    }
}

function handleClick(event: MouseEvent) {
    event.preventDefault();
    var elem = document.getElementById('canvas') as HTMLCanvasElement,
        elemLeft = elem.offsetLeft + elem.clientLeft,
        elemTop = elem.offsetTop + elem.clientTop;

    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;

    var row = Math.trunc(x / blockImage.BlockSize);
    var col = Math.trunc(y / blockImage.BlockSize);

    blockImage.Grid[row][col].Filled = true;
    render(blockImage);
}
