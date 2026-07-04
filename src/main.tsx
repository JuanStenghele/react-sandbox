import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from "react-router";
import App from "./App";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <App />
    </BrowserRouter>
  </StrictMode>
);
