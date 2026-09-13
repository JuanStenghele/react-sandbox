import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import backend from './backend';
import type { Book } from '../types/book';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export interface PostBookRequest {
  title: string;
  author_id: string;
  description?: string;
  isbn?: string;
  publication_date?: Date;
  cover_image?: File;
}

export interface PostBookResponse {
  id: string;
  title: string;
  description?: string;
  isbn?: string;
  publication_date?: Date;
  cover_image_url?: string;
}

export const postBook = async (data: PostBookRequest): Promise<PostBookResponse> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('author_id', data.author_id);
  if (data.description !== undefined) {
    formData.append('description', data.description);
  }
  if (data.isbn !== undefined) {
    formData.append('isbn', data.isbn);
  }
  if (data.publication_date !== undefined) {
    formData.append('publication_date', data.publication_date.toISOString().split("T")[0]);
  }
  if (data.cover_image !== undefined) {
    formData.append('cover_image', data.cover_image);
  }
  const response = await backend.post<PostBookResponse>('/v1/books', formData);
  return response.data;
};

export const usePostBook = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: PostBookRequest) => postBook(params),
    onSuccess: (_, variables: PostBookRequest) => {
      queryClient.invalidateQueries({
        queryKey: ['books']
      });
      enqueueSnackbar(t('books.created', { title: variables.title }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('books.createFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};

export interface RawBook {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  isbn: string | null;
  publication_date: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export const getBook = async (id: string): Promise<Book> => {
  const response = await backend.get<RawBook>(`/v1/books/${id}`);
  const book = response.data;
  return {
    ...book,
    publication_date: book.publication_date ? new Date(book.publication_date) : null,
    created_at: new Date(book.created_at)
  };
};

export const useGetBook = (id: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => getBook(id as string),
    enabled: enabled && !!id
  });
};

export interface GetBooksRequest {
  search_term: string;
  page: number;
  page_size: number;
}

interface GetBooksBaseResponse {
  total_books: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface GetBooksRawResponse extends GetBooksBaseResponse {
  books: RawBook[];
}

export interface GetBooksResponse extends GetBooksBaseResponse {
  books: Book[];
}

export const getBooks = async (params: GetBooksRequest): Promise<GetBooksResponse> => {
  const response = await backend.get<GetBooksRawResponse>('/v1/books', { params });
  const books = response.data.books.map((book) => ({
    ...book,
    publication_date: book.publication_date ? new Date(book.publication_date) : null,
    created_at: new Date(book.created_at)
  }));
  return { ...response.data, books };
};

export const useGetBooks = (params: GetBooksRequest) => {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => getBooks(params),
    placeholderData: keepPreviousData
  });
};

export interface DeleteBooksRequest {
  ids: string[];
}

export const deleteBooks = async (data: DeleteBooksRequest): Promise<void> => {
  const params = new URLSearchParams();
  data.ids.forEach((id) => params.append('ids', id));
  await backend.delete('/v1/books', { params });
};

export const useDeleteBooks = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: DeleteBooksRequest) => deleteBooks(params),
    onSuccess: (_, variables: DeleteBooksRequest) => {
      queryClient.invalidateQueries({
        queryKey: ['books']
      });
      enqueueSnackbar(t('books.deleted', { count: variables.ids.length }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('books.deleteFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};

export interface PatchBookRequest {
  title?: string;
  author_id?: string;
  description?: string;
  isbn?: string;
  publication_date?: Date;
  cover_image?: File;
}

export interface PatchBookResponse {
  id: string;
  title: string;
  author_id: string;
  description?: string;
  isbn?: string;
  publication_date?: Date;
  cover_image_url?: string;
  created_at: Date;
}

export const patchBook = async (id: string, data: PatchBookRequest): Promise<PatchBookResponse> => {
  const formData = new FormData();
  if (data.title !== undefined) {
    formData.append('title', data.title);
  }
  if (data.author_id !== undefined) {
    formData.append('author_id', data.author_id);
  }
  if (data.description !== undefined) {
    formData.append('description', data.description);
  }
  if (data.isbn !== undefined) {
    formData.append('isbn', data.isbn);
  }
  if (data.publication_date !== undefined) {
    formData.append('publication_date', data.publication_date.toISOString().split("T")[0]);
  }
  if (data.cover_image !== undefined) {
    formData.append('cover_image', data.cover_image);
  }
  const response = await backend.patch<PatchBookResponse>(`/v1/books/${id}`, formData);
  return response.data;
};

export const usePatchBook = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (params: { id: string; data: PatchBookRequest }) => patchBook(params.id, params.data),
    onSuccess: (data: PatchBookResponse) => {
      queryClient.invalidateQueries({
        queryKey: ['books']
      });
      enqueueSnackbar(t('books.updated', { title: data.title }), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('books.updateFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};

export const deleteBookCover = async (id: string): Promise<void> => {
  await backend.delete(`/v1/books/${id}/cover-images`);
};

export const useDeleteBookCover = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => deleteBookCover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['books']
      });
      enqueueSnackbar(t('books.coverDeleted'), {
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(t('books.coverDeleteFailed', { message: `${error.name} - ${error.message}` }), {
        variant: 'error'
      });
    }
  });
};
