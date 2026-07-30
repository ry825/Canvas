import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "@ui/styles/global.css";

const rootElement = document.querySelector("#root");

if (rootElement === null) {
  throw new Error("CanvasDoc root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
