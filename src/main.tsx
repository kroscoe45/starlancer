// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { UnifiedDataStoreProvider } from "./components/providers/UnifiedDataStoreProvider.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <UnifiedDataStoreProvider>
          <App />
        </UnifiedDataStoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

