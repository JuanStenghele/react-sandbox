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
