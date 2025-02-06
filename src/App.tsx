import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./components/Sidebar";
import RetroDashboard from "./pages/RetroDashboard";
import DataManager from "./pages/DataManager";

export default function App() {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<RetroDashboard />} />
            <Route path="/data-manager" element={<DataManager />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}
