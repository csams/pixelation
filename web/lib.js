var blockImage;
var down = false;
class Color {
    R;
    G;
    B;
}
class Point {
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
function handleMouseDown(event) {
    down = true;
}
function handleMouseUp(event) {
    down = false;
}
function handleMouseMove(event) {
    if (down) {
        handleClick(event);
    }
}
function handleClick(event) {
    event.preventDefault();
    var elem = document.getElementById('canvas'), elemLeft = elem.offsetLeft + elem.clientLeft, elemTop = elem.offsetTop + elem.clientTop;
    var x = event.pageX - elemLeft, y = event.pageY - elemTop;
    var row = Math.trunc(x / blockImage.BlockSize);
    var col = Math.trunc(y / blockImage.BlockSize);
    blockImage.Grid[row][col].Filled = true;
    render(blockImage);
}
