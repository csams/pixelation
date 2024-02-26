import React, { Component } from "react";
import { handleClear, handleFloodFill, handleSubmit, handleMouseDown, handleMouseUp, handleDoubleClick, handleMouseMove } from "./lib";
import "./style.css"

function Form() {
    return (
        <div className="form">
            <form id="form" name="form" onSubmit={handleSubmit}>
                <label htmlFor="colors">Number of colors (from 2 to 256)</label>
                <input id="colors" name="colors" type="number" min="2" max="256" defaultValue="16" />
                <label htmlFor="block-size">Number of pixels in a block (from 1 to 256)</label>
                <input id="block-size" name="block-size" type="number" min="1" max="256" defaultValue="8" />
                <input id="file" name="file" type="file" accept=".png, .jpg, .jpeg" />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

function Controls() {
    return (
        <div className="controls">
            <a className="control" onClick={handleFloodFill}>Fill</a>
            <a className="control" onClick={handleClear}>Clear</a>
        </div>
    );
}

function Picture() {
    return (
        <div id="picture" className="picture-container">
            <canvas id="canvas" className="picture" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onDoubleClick={handleDoubleClick} />
        </div>
    );
}

export default function App() {
    return (
        <div className="box">
            <Form />
            <Controls />
            <Picture />
        </div>
    );
}
