import { useQuery } from '@tanstack/react-query';
import backend from './backend';
import type { Author } from '../types/author';

export interface GetAuthorsRequest {
  search_term: string;
  page: number;
  page_size: number;
}

export interface GetAuthorsResponse {
  authors: Author[];
  total_authors: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export const getAuthors = async (params: GetAuthorsRequest): Promise<GetAuthorsResponse> => {
  const response = await backend.get<GetAuthorsResponse>('/v1/authors', { params });
  return response.data;
};

export const useGetAuthors = (params: GetAuthorsRequest) => {
  return useQuery({ queryKey: ['authors', params], queryFn: () => getAuthors(params) });
};
