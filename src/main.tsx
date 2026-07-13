import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes";
import { Provider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "react-oidc-context";
import { authOIDCConfig } from "./services/auth";

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
      <AuthProvider {...authOIDCConfig}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CssBaseline />
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
