import { atom } from 'jotai';

export const selectedAuthorRowsIds = atom<Set<string>>(new Set<string>());