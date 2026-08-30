import { atom } from 'jotai';

export type AuthorsTableState = {
  searchTerm: string;
  page: number;
  pageSize: number;
  selectedRowsIds: Set<string>
};

export const authorsTableState = atom<AuthorsTableState>({
  searchTerm: '',
  page: 0,
  pageSize: 10,
  selectedRowsIds: new Set<string>()
});
