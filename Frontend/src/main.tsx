import React from 'react';
import { createRoot } from "react-dom/client"; 
import App from "./app/App"; 
import "./app/styles/index.css";

// 'as HTMLElement' likhne se TypeScript ka null wala error chala jata hai
const rootElement = document.getElementById("root") as HTMLElement;

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);