import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import backend from './backend';
import type { Author } from '../types/author';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

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
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: PostAuthorRequest) => postAuthor(params),
    onSuccess: (_, variables: PostAuthorRequest) => {
      queryClient.invalidateQueries({
        queryKey: ['authors']
      });
      enqueueSnackbar(t('authors.created', { name: variables.name }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('authors.createFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};

export const getAuthor = async (id: string): Promise<Author> => {
  const response = await backend.get<Author>(`/v1/authors/${id}`);
  return response.data;
};

export const useGetAuthor = (id: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['authors', id],
    queryFn: () => getAuthor(id as string),
    enabled: enabled && !!id,
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
  return useQuery({ 
    queryKey: ['authors', params], 
    queryFn: () => getAuthors(params),
    placeholderData: keepPreviousData
  });
};

export interface GetInfiniteAuthorsRequest {
  search_term: string;
  page_size: number;
}

export const useGetInfiniteAuthors = (params: GetInfiniteAuthorsRequest) => {
  return useInfiniteQuery({
    queryKey: ['authors', params],
    queryFn: ({ pageParam }) => getAuthors({
      search_term: params.search_term,
      page: pageParam,
      page_size: params.page_size
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.current_page < lastPage.total_pages ? lastPage.current_page + 1 : undefined
  });
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
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: DeleteAuthorsRequest) => deleteAuthors(params),
    onSuccess: (_, variables: DeleteAuthorsRequest) => {
      queryClient.invalidateQueries({
        queryKey: ['authors']
      });
      enqueueSnackbar(t('authors.deleted', { count: variables.ids.length }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('authors.deleteFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};

export interface PatchAuthorRequest {
  name: string;
}

export interface PatchAuthorResponse {
  id: string;
  name: string;
}

export const patchAuthor = async (id: string, data: PatchAuthorRequest): Promise<PatchAuthorResponse> => {
  const response = await backend.patch<PatchAuthorResponse>(`/v1/authors/${id}`, { ...data });
  return response.data;
};

export const usePatchAuthor = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: { id: string; data: PatchAuthorRequest }) => patchAuthor(params.id, params.data),
    onSuccess: (_, variables: { id: string; data: PatchAuthorRequest }) => {
      queryClient.invalidateQueries({
        queryKey: ['authors']
      });
      enqueueSnackbar(t('authors.updated', { name: variables.data.name }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('authors.updateFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};
