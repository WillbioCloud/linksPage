import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;