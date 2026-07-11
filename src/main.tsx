import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";
import { Provider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false 
    } 
  }
})
const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CssBaseline />
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
