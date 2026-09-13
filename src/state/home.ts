import { atom } from 'jotai';
import { defaultLanguageKey } from '../constants';

export const homeDrawerOpen = atom(true);

export const language = atom(defaultLanguageKey);
