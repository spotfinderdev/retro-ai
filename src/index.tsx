import React from "react";
import ReactDOM from "react-dom/client";
import RetroDashboard from "./components/RetroDashboard"; 
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <RetroDashboard />
  </React.StrictMode>
);
