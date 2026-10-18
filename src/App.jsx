import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";

const Admin = lazy(() => import("@/pages/Admin"));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;