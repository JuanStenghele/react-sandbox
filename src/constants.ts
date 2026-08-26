export const ROUTES = {
  login: '/login',
  books: '/books',
  authors: '/authors',
  unauthorized: '/unauthorized',
  newAuthor: '/authors/new',
  editAuthor: '/authors/:id',
} as const;

export const adminScope = 'admin';
