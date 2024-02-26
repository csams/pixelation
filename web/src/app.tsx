import React, { Component } from "react";
import { handleSubmit, handleMouseDown, handleMouseUp, handleDoubleClick, handleMouseMove } from "./lib";

class App extends Component {
    render() {
        return (
            <div>
                <div className="form">
                    <form id="form" name="form" onSubmit={handleSubmit}>
                        <label htmlFor="colors">Number of colors (from 2 to 256)</label>
                        <input id="colors" name="colors" type="number" min="2" max="256" value="16" />
                        <label htmlFor="block-size">Number of pixels in a block (from 1 to 256)</label>
                        <input id="block-size" name="block-size" type="number" min="1" max="256" value="8" />
                        <input id="file" name="file" type="file" accept=".png, .jpg, .jpeg" />
                        <button>Submit</button>
                    </form>
                </div>
                <div id="picture" className="picture">
                    <canvas id="canvas" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onDoubleClick={handleDoubleClick} />
                </div>
            </div>
        )
    }
}

export default App;
