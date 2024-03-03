import React from "react";

function Camera(canvasId: string) {
    let canvas = document.querySelector(canvasId) as HTMLCanvasElement;
    let ctx = canvas.getContext("2d");

    let offScreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    let offScreenContext = offScreenCanvas.getContext("2d");
        
    return (
        <div></div>
    )
}

export {
    Camera
}
