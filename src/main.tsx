import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router';
import AppRoutes from './routes';
import { Provider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from 'react-oidc-context';
import { authOIDCConfig } from './services/auth';
import { SnackbarProvider } from 'notistack';

// Import font
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

import { MyThemeProvider } from './themes';

// Initialize translations
import './translations';

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false 
    } 
  }
})
const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider>
      <AuthProvider {...authOIDCConfig}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SnackbarProvider
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
            >
              <MyThemeProvider>
                <CssBaseline />
                <AppRoutes />
              </MyThemeProvider>
            </SnackbarProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
