import App from "./app";
import React from "react";
import { createRoot } from "react-dom/client"
import 'bootstrap/dist/css/bootstrap.min.css';

const domNode = document.querySelector("#app");
if (domNode) {
    const root = createRoot(domNode);
    root.render(<App />);
}
