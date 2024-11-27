import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Quine from "./components/Quine.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Quine />
  </StrictMode>
);
