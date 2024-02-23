var blockImage;
var down = false;
class Color {
    R;
    G;
    B;
}
class Point {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
    }
    X;
    Y;
}
class Rect {
    Min;
    Max;
}
class Block {
    Idx;
    Filled;
    Rect;
}
class BlockImage {
    W;
    H;
    BlockSize;
    Palette;
    Grid;
}
function clear(doc) {
    doc.Grid.forEach(row => row.forEach(block => {
        block.Filled = false;
    }));
}
function render(image) {
    const canvas = document.querySelector("#canvas");
    canvas.width = image.W;
    canvas.height = image.H;
    let c = canvas.getContext("2d");
    if (!c) {
        console.log("Couldn't get canvas context.");
        return;
    }
    c.clearRect(0, 0, canvas.width, canvas.height);
    image.Grid.forEach(row => row.forEach(block => {
        let p = image.Palette[block.Idx];
        let rect = block.Rect;
        let d = 64 / 255;
        let color = block.Filled ? `rgb(${p.R}, ${p.G}, ${p.B})` : "black";
        c.fillStyle = color;
        c.fillRect(rect.Min.X, rect.Min.Y, rect.Max.X - rect.Min.X, rect.Max.Y - rect.Min.Y);
    }));
}
function drawBlock(pt) {
    blockImage.Grid[pt.Y][pt.X].Filled = true;
}
function handleSubmit(event) {
    event.preventDefault();
    const fd = new FormData(document.querySelector("#form"));
    fetch("/api/convert", {
        method: "post",
        body: fd
    }).then((res) => {
        return res.json();
    }).then((doc) => {
        blockImage = doc;
        clear(blockImage);
        render(doc);
    });
}
function getGridLocation(event) {
    var elem = document.getElementById('canvas'), elemLeft = elem.offsetLeft + elem.clientLeft, elemTop = elem.offsetTop + elem.clientTop;
    var x = event.pageX - elemLeft, y = event.pageY - elemTop;
    x = Math.trunc(x / blockImage.BlockSize);
    y = Math.trunc(y / blockImage.BlockSize);
    return new Point(x, y);
}
function flood(pt) {
    let block = blockImage.Grid[pt.Y][pt.X];
    if (block.Filled) {
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
function handleDoubleClick(event) {
    event.preventDefault();
    let pt = getGridLocation(event);
    flood(pt);
    render(blockImage);
}
function handleClick(event) {
    event.preventDefault();
    let pt = getGridLocation(event);
    blockImage.Grid[pt.Y][pt.X].Filled = true;
    render(blockImage);
}
function handleMouseMove(event) {
    if (down) {
        event.preventDefault();
        let pt = getGridLocation(event);
        blockImage.Grid[pt.Y][pt.X].Filled = true;
        render(blockImage);
    }
}
function handleMouseDown(event) {
    down = true;
}
function handleMouseUp(event) {
    down = false;
}
