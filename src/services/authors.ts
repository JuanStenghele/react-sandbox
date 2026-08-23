import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import backend from './backend';
import type { Author } from '../types/author';

export interface PostAuthorRequest {
  name: string;
}

export interface PostAuthorResponse {
  id: string;
  name: string;
}

export const postAuthor = async (data: PostAuthorRequest): Promise<PostAuthorResponse> => {
  const response = await backend.post<PostAuthorResponse>('/v1/authors', { ...data });
  return response.data;
};

export const usePostAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: PostAuthorRequest) => postAuthor(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authors']
      });
      // TODO: Show a success toast notification
    },
    onError: () => {
      // TODO: Show an error toast notification
    }
  });
};

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

export interface DeleteAuthorsRequest {
  ids: string[];
}

export const deleteAuthors = async (data: DeleteAuthorsRequest): Promise<void> => {
  const params = new URLSearchParams();
  data.ids.forEach((id) => params.append('ids', id));
  await backend.delete('/v1/authors', { params });
};

export const useDeleteAuthors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: DeleteAuthorsRequest) => deleteAuthors(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authors']
      });
      // TODO: Show a success toast notification
    },
    onError: () => {
      // TODO: Show an error toast notification
    }
  });
};
