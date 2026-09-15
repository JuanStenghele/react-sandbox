import { createTheme, type ThemeOptions, ThemeProvider } from '@mui/material/styles';
import type { ThemeMode } from './types/home';
import { useMemo, type ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import { theme as themeAtom } from './state/home';

export const MyThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useAtomValue(themeAtom);

  const getThemeOptions = (mode: ThemeMode): ThemeOptions => {
    return {
      palette: {
        mode,
        primary: {
          main: '#558b2f'
        },
        secondary: {
          main: '#78909c'
        },
        error: {
          main: '#f44336'
        },
        warning: {
          main: '#ff9800'
        },
        info: {
          main: '#1976d2'
        },
        success: {
          main: '#388e3c'
        }
      },
      typography: {
        fontFamily: 'Inter'
      }
    }
  }

  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

export default MyThemeProvider;
