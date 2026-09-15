import { atom } from 'jotai';
import { defaultLanguageKey, defaultTheme, languages, languageStorageKey, themeStorageKey } from '../constants';
import type { ThemeMode } from '../types/home';

export const homeDrawerOpen = atom(true);

export const getPersistedLanguageKey = (): string => {
  const stored = localStorage.getItem(languageStorageKey);
  return languages.some((language) => language.key === stored) ? stored! : defaultLanguageKey;
};

export const language = atom(getPersistedLanguageKey());

export const getPersistedThemeKey = (): ThemeMode => {
  const stored = localStorage.getItem(themeStorageKey);
  const isValid = stored === 'light' || stored === 'dark';
  return isValid ? stored : defaultTheme;
};

export const theme = atom<ThemeMode>(getPersistedThemeKey());
