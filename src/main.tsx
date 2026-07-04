import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
