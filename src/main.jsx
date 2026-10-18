import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";

// Registro do Service Worker para suporte PWA (Adicionar à Tela de Início)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.log("SW registration failed:", err);
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
