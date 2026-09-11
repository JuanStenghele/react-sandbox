import { atom } from 'jotai';

export type BooksTableState = {
  searchTerm: string;
  page: number;
  pageSize: number;
  selectedRowsIds: Set<string>
};

export const booksTableState = atom<BooksTableState>({
  searchTerm: '',
  page: 0,
  pageSize: 10,
  selectedRowsIds: new Set<string>()
});
