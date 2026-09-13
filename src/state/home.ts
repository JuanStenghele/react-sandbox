import { atom } from 'jotai';
import { defaultLanguageKey, languages, languageStorageKey } from '../constants';

export const homeDrawerOpen = atom(true);

export const getPersistedLanguageKey = (): string => {
  const stored = localStorage.getItem(languageStorageKey);
  return languages.some((language) => language.key === stored) ? stored! : defaultLanguageKey;
};

export const language = atom(getPersistedLanguageKey());
