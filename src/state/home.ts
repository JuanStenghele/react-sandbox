import { atom } from 'jotai';
import { english } from '../constants';

export const homeDrawerOpen = atom(true);

export const language = atom(english.key);
