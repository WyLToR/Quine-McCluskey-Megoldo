import { createRoot } from "react-dom/client";
import "./index.css";
import Quine from "./components/Quine";

createRoot(document.getElementById("root")!).render(
  <main className="w-full h-full flex justify-center items-center">
    <Quine />
  </main>
);
