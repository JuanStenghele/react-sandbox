import type { FlagComponent } from 'country-flag-icons/react/3x2'

export type Language = {
  key: string,
  label: string,
  flag: FlagComponent
};

export type ThemeMode = 'light' | 'dark';
