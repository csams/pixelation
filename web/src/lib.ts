import { Block, BlockImage, Point } from "./types"
import { MouseEvent } from "react";

var blockImage: BlockImage;
var down = false;

function clear(doc: BlockImage): void {
    doc.Grid.forEach(row => row.forEach(block => {
        block.Filled = false;
    }));
}

function paintBlock(c: CanvasRenderingContext2D, image: BlockImage, block: Block): void {
    let rect = block.Rect;
    if (block.Filled) {
        let p = image.Palette[block.Idx];
        let color: string = `rgb(${p.R}, ${p.G}, ${p.B})`;
        c.fillStyle = color;
        c.fillRect(rect.Min.X, rect.Min.Y, rect.Max.X - rect.Min.X, rect.Max.Y - rect.Min.Y);
    } else {
        let d = Math.floor(image.BlockSize / 2);
        c.textAlign = "center";
        c.fillStyle = "black";
        c.font = `${image.BlockSize}px serif`;
        c.lineWidth = 1;
        c.strokeRect(rect.Min.X, rect.Min.Y, rect.Max.X - rect.Min.X, rect.Max.Y - rect.Min.Y);
        c.fillText(`${block.Idx + 1}`, rect.Min.X + d, rect.Min.Y + image.BlockSize, image.BlockSize - 1);
    }
}

function render(image: BlockImage): void {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    canvas.width = image.W;
    canvas.height = image.H;
    let c = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (!c) {
        console.log("Couldn't get canvas context.");
        return;
    }

    c.clearRect(0, 0, canvas.width, canvas.height);
    image.Grid.forEach(row => row.forEach(block => {
        paintBlock(c, image, block);
    }));
}

export function handleSubmit(event: MouseEvent<HTMLFormElement>): void {
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

    x = Math.floor(x / blockImage.BlockSize);
    y = Math.floor(y / blockImage.BlockSize);
    return { X: x, Y: y };
}

function flood(point: Point): void {
    let blocks = new Array<Block>();

    let inner = (pt: Point) => {
        let block: Block = blockImage.Grid[pt.Y][pt.X];
        if (block.Filled) {
            return;
        }

        block.Filled = true;
        blocks.push(block);

        // fill left
        if (pt.X - 1 >= 0) {
            if (block.Idx === blockImage.Grid[pt.Y][pt.X - 1].Idx) {
                inner({ X: pt.X - 1, Y: pt.Y });
            }
        }

        // fill right
        if (pt.X + 1 < blockImage.Grid[pt.Y].length) {
            if (block.Idx === blockImage.Grid[pt.Y][pt.X + 1].Idx) {
                inner({ X: pt.X + 1, Y: pt.Y });
            }
        }

        // fill up
        if (pt.Y - 1 >= 0) {
            if (block.Idx === blockImage.Grid[pt.Y - 1][pt.X].Idx) {
                inner({ X: pt.X, Y: pt.Y - 1 });
            }
        }

        // fill down
        if (pt.Y + 1 < blockImage.Grid.length) {
            if (block.Idx === blockImage.Grid[pt.Y + 1][pt.X].Idx) {
                inner({ X: pt.X, Y: pt.Y + 1 });
            }
        }
    }
    inner(point);

    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    let c = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (!c) {
        console.log("Couldn't get canvas context.");
        return;
    }

    blocks.forEach(block => {
        paintBlock(c, blockImage, block);
    });
}

function handleDoubleClick(event: MouseEvent<HTMLCanvasElement>): void {
    event.preventDefault();
    let pt = getGridLocation(event);
    flood(pt);
    render(blockImage);
}

function handleClick(event: MouseEvent): void {
    event.preventDefault();

    let pt = getGridLocation(event);

    blockImage.Grid[pt.Y][pt.X].Filled = true;
    render(blockImage);
}

function handleMouseMove(event: MouseEvent<HTMLCanvasElement>): void {
    if (down) {
        event.preventDefault();

        let pt = getGridLocation(event);

        let block = blockImage.Grid[pt.Y][pt.X];
        block.Filled = true;
        const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
        let c = canvas.getContext("2d") as CanvasRenderingContext2D;

        if (!c) {
            console.log("Couldn't get canvas context.");
            return;
        }
        paintBlock(c, blockImage, block);
    }
}

function handleMouseDown(): void {
    down = true;
}

function handleMouseUp(): void {
    down = false;
}

export { handleClick, handleDoubleClick, handleMouseDown, handleMouseUp, handleMouseMove }
