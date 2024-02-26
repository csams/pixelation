import React, { Component } from "react";
import { handleClear, handleFloodFill, handleSubmit, handleMouseDown, handleMouseUp, handleDoubleClick, handleMouseMove } from "./lib";

class Form extends Component {
    render() {
        return (
            <div className="form">
                <form id="form" name="form" onSubmit={handleSubmit}>
                    <label htmlFor="colors">Number of colors (from 2 to 256)</label>
                    <input id="colors" name="colors" type="number" min="2" max="256" defaultValue="16" />
                    <label htmlFor="block-size">Number of pixels in a block (from 1 to 256)</label>
                    <input id="block-size" name="block-size" type="number" min="1" max="256" defaultValue="8" />
                    <input id="file" name="file" type="file" accept=".png, .jpg, .jpeg" />
                    <button>Submit</button>
                </form>
            </div>
        );
    }
}

class Controls extends Component {
    render() {
        return (
            <div className="controls">
                <div className="control">
                    <button onClick={handleFloodFill}>Fill</button>
                </div>
                <div className="control">
                    <button onClick={handleClear}>Clear</button>
                </div>
            </div>
        );
    }
}

class Picture extends Component {
    render() {
        return (
            <div id="picture" className="picture-container">
                <canvas id="canvas" className="picture" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onDoubleClick={handleDoubleClick} />
            </div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div className="box">
                <Form />
                <Controls />
                <Picture />
            </div>
        );
    }
}

export default App;
