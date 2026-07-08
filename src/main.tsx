import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";
import { Provider } from 'jotai'

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <CssBaseline />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
