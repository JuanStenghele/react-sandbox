import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import backend from './backend';
import MockAdapter from 'axios-mock-adapter';
import type { RawBook, GetBooksRawResponse, PostBookRequest, PostBookResponse, PatchBookRequest, PatchBookResponse, DeleteBooksRequest } from './books';
import { getBooks, useGetBooks, postBook, usePostBook, getBook, useGetBook, patchBook, usePatchBook, deleteBooks, useDeleteBooks } from './books';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import type { ReactNode } from 'react';

vi.mock('notistack');

describe('books service', () => {
  const sampleRawBook: RawBook = { 
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    publication_date: '2019-09-13',
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg',
    created_at: '2026-06-25T03:28:59.552152'
  }
  const sampleRawResponse: GetBooksRawResponse = {
    books: [sampleRawBook],
    total_books: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10
  }
  const sampleResult = {
    ...sampleRawResponse,
    books: [
      {
        ...sampleRawBook,
        publication_date: new Date(sampleRawBook.publication_date!),
        created_at: new Date(sampleRawBook.created_at),
      }
    ]
  };

  const sampleRequestParams = { search_term: '', page: 1, page_size: 10 };

  const sampleBook = {
    ...sampleRawBook,
    publication_date: new Date(sampleRawBook.publication_date!),
    created_at: new Date(sampleRawBook.created_at),
  };

  const samplePostBookResponse: PostBookResponse = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg'
  };

  const samplePostBookRequest: PostBookRequest = {
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059'
  };

  const samplePatchBookResponse: PatchBookResponse = {
    id: sampleRawBook.id,
    title: 'The Pragmatic Programmer (updated)',
    author_id: sampleRawBook.author_id,
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg',
    created_at: new Date(sampleRawBook.created_at)
  };

  const samplePatchBookRequest: { id: string; data: PatchBookRequest } = {
    id: sampleRawBook.id,
    data: { title: samplePatchBookResponse.title }
  };

  const sampleDeleteBooksRequest: DeleteBooksRequest = { ids: ['60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd', '6d0d5f0b-2f3a-4f9b-9f1e-2d2b3c4d5e6f'] };

  const mock = new MockAdapter(backend);
  const mockedUseSnackbar = vi.mocked(useSnackbar);
  const enqueueSnackbar = vi.fn();

  beforeEach(() => {
    enqueueSnackbar.mockReset();
    mockedUseSnackbar.mockReturnValue({
      enqueueSnackbar,
      closeSnackbar: vi.fn()
    });
  });

  afterEach(() => {
    mock.reset();
  });

  describe('request', () => {
    it('returns a successful response', async () => {
      mock.onGet('/v1/books').reply(200, sampleRawResponse);

      const response = await getBooks(sampleRequestParams);

      expect(response).toEqual(sampleResult);
    });

    it('returns a 5xx response', async () => {
      mock.onGet('/v1/books').reply(500);

      await expect(getBooks(sampleRequestParams)).rejects.toBeDefined();
    });

    it('returns a successful response on postBook', async () => {
      mock.onPost('/v1/books').reply(200, samplePostBookResponse);

      const response = await postBook(samplePostBookRequest);

      expect(response).toEqual(samplePostBookResponse);
    });

    it('returns a 5xx response on postBook', async () => {
      mock.onPost('/v1/books').reply(500);

      await expect(postBook(samplePostBookRequest)).rejects.toBeDefined();
    });

    it('returns a successful response on getBook', async () => {
      mock.onGet(`/v1/books/${sampleRawBook.id}`).reply(200, sampleRawBook);

      const response = await getBook(sampleRawBook.id);

      expect(response).toEqual(sampleBook);
    });

    it('returns a 5xx response on getBook', async () => {
      mock.onGet(`/v1/books/${sampleRawBook.id}`).reply(500);

      await expect(getBook(sampleRawBook.id)).rejects.toBeDefined();
    });

    it('returns a successful response on patchBook', async () => {
      mock.onPatch(`/v1/books/${sampleRawBook.id}`).reply(200, samplePatchBookResponse);

      const response = await patchBook(samplePatchBookRequest.id, samplePatchBookRequest.data);

      expect(response).toEqual({
        ...samplePatchBookResponse,
        created_at: samplePatchBookResponse.created_at.toISOString()
      });
    });

    it('returns a 5xx response on patchBook', async () => {
      mock.onPatch(`/v1/books/${sampleRawBook.id}`).reply(500);

      await expect(patchBook(samplePatchBookRequest.id, samplePatchBookRequest.data)).rejects.toBeDefined();
    });

    it('returns a successful response on deleteBooks', async () => {
      mock.onDelete('/v1/books').reply(200);

      await expect(deleteBooks(sampleDeleteBooksRequest)).resolves.toBeUndefined();
      expect(mock.history.delete).toHaveLength(1);
      expect(mock.history.delete[0].params?.toString()).toBe('ids=60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd&ids=6d0d5f0b-2f3a-4f9b-9f1e-2d2b3c4d5e6f');
    });

    it('returns a 5xx response on deleteBooks', async () => {
      mock.onDelete('/v1/books').reply(500);

      await expect(deleteBooks(sampleDeleteBooksRequest)).rejects.toBeDefined();
    });
  });

  describe('hooks', () => {
    const buildWrapper = (queryClient?: QueryClient) => {
      const client = queryClient ?? new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
          { children }
        </QueryClientProvider>
      );
    };

    it('handles a successful query', async () => {
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBooks(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleResult);
    });

    it('handles a failed query', async () => {
      mock.onGet('/v1/books').reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBooks(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });

    it('handles a successful usePostBook mutation', async () => {
      mock.onPost('/v1/books').reply(200, samplePostBookResponse);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePostBook(), { wrapper });

      result.current.mutate(samplePostBookRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(samplePostBookResponse);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['books'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Book The Pragmatic Programmer created successfully', {
        variant: 'success'
      });
    });

    it('handles a failed usePostBook mutation', async () => {
      mock.onPost('/v1/books').reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePostBook(), { wrapper });

      result.current.mutate(samplePostBookRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create book'),
        { variant: 'error' }
      );
    });

    it('handles a successful useGetBook query', async () => {
      mock.onGet(`/v1/books/${sampleRawBook.id}`).reply(200, sampleRawBook);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBook(sampleRawBook.id), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleBook);
    });

    it('handles a failed useGetBook query', async () => {
      mock.onGet(`/v1/books/${sampleRawBook.id}`).reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBook(sampleRawBook.id), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });

    it('does not fetch when enabled is false', () => {
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBook(sampleRawBook.id, false), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mock.history.get).toHaveLength(0);
    });

    it('does not fetch when id is undefined', () => {
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBook(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mock.history.get).toHaveLength(0);
    });

    it('handles a successful usePatchBook mutation', async () => {
      mock.onPatch(`/v1/books/${sampleRawBook.id}`).reply(200, samplePatchBookResponse);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePatchBook(), { wrapper });

      result.current.mutate(samplePatchBookRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual({
        ...samplePatchBookResponse,
        created_at: samplePatchBookResponse.created_at.toISOString()
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['books'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Book The Pragmatic Programmer (updated) updated successfully', {
        variant: 'success'
      });
    });

    it('handles a failed usePatchBook mutation', async () => {
      mock.onPatch(`/v1/books/${sampleRawBook.id}`).reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePatchBook(), { wrapper });

      result.current.mutate(samplePatchBookRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update book'),
        { variant: 'error' }
      );
    });

    it('handles a successful useDeleteBooks mutation', async () => {
      mock.onDelete('/v1/books').reply(200);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => useDeleteBooks(), { wrapper });

      result.current.mutate(sampleDeleteBooksRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['books'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Deleted 2 books successfully', {
        variant: 'success'
      });
    });

    it('handles a failed useDeleteBooks mutation', async () => {
      mock.onDelete('/v1/books').reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => useDeleteBooks(), { wrapper });

      result.current.mutate(sampleDeleteBooksRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete books'),
        { variant: 'error' }
      );
    });
  });
})
