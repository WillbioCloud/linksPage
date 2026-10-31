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
        {(() => {
          // Detecta se o usuário está acessando pelo subdomínio admin.*
          const isSubdomainAdmin =
            typeof window !== "undefined" &&
            (window.location.hostname.startsWith("admin.") ||
             window.location.search.includes("subdomain=admin"));

          if (isSubdomainAdmin) {
            return (
              <Routes>
                {/* No subdomínio admin, a raiz já carrega o Admin diretamente */}
                <Route path="/" element={<Admin />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Admin />} />
              </Routes>
            );
          }

          return (
            <Routes>
              {/* No domínio principal, carrega a Home e mantém /admin como compatibilidade */}
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          );
        })()}
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;