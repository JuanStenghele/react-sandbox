import type { Language } from './types/home';
import { AR, US } from 'country-flag-icons/react/3x2';

export const ROUTES = {
  login: '/login',
  books: '/books',
  authors: '/authors',
  unauthorized: '/unauthorized',
  newAuthor: '/authors/new',
  editAuthor: '/authors/:id',
  newBook: '/books/new',
  editBook: '/books/:id'
} as const;

export const adminScope = 'admin';

export const english: Language = {
  key: 'en',
  label: 'English',
  flag: US
};
export const spanish: Language = {
  key: 'es',
  label: 'Español',
  flag: AR
};
export const languages: Language[] = [english, spanish];
