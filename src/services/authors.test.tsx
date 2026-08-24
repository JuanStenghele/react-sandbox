import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import backend from './backend';
import MockAdapter from 'axios-mock-adapter';
import type { Author } from '../types/author';
import type { DeleteAuthorsRequest, GetAuthorsResponse, PostAuthorResponse } from './authors';
import { postAuthor, usePostAuthor, getAuthors, useGetAuthors, deleteAuthors, useDeleteAuthors } from './authors';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import type { ReactNode } from 'react';

vi.mock('notistack');

describe('authors service', () => {
  const sampleAuthor: Author = { 
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen',
  }

  const sampleGetAuthorsResponse: GetAuthorsResponse = {
    authors: [sampleAuthor],
    total_authors: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10
  }
  const samplePostAuthorResponse: PostAuthorResponse = sampleAuthor;

  const samplePostAuthorRequest = { name: sampleAuthor.name };
  const sampleGetAuthorRequest = { search_term: '', page: 1, page_size: 10 };
  const sampleDeleteAuthorsRequest: DeleteAuthorsRequest = { ids: ['a6f682de-5fd4-442e-a237-71b30281a2d6', '6d0d5f0b-2f3a-4f9b-9f1e-2d2b3c4d5e6f'] };

  const mock = new MockAdapter(backend);
  const mockedUseSnackbar = vi.mocked(useSnackbar);
  const enqueueSnackbar = vi.fn();

  beforeEach(() => {
    enqueueSnackbar.mockReset();
    mockedUseSnackbar.mockReturnValue({
      enqueueSnackbar,
      closeSnackbar: vi.fn(),
    });
  });

  afterEach(() => {
    mock.reset();
  });

  describe('requests', () => {
    it('returns a successful response on postAuthor', async () => {
      mock.onPost('/v1/authors').reply(200, samplePostAuthorResponse);

      const response = await postAuthor(samplePostAuthorRequest);

      expect(response).toEqual(samplePostAuthorResponse);
    });

    it('returns a 5xx response on postAuthor', async () => {
      mock.onPost('/v1/authors').reply(500);

      await expect(postAuthor(samplePostAuthorRequest)).rejects.toBeDefined();
    });

    it('returns a successful response on getAuthors', async () => {
      mock.onGet('/v1/authors').reply(200, sampleGetAuthorsResponse);

      const response = await getAuthors(sampleGetAuthorRequest);

      expect(response).toEqual(sampleGetAuthorsResponse);
    });

    it('returns a 5xx response on getAuthors', async () => {
      mock.onGet('/v1/authors').reply(500);

      await expect(getAuthors(sampleGetAuthorRequest)).rejects.toBeDefined();
    });

    it('returns a successful response on deleteAuthors', async () => {
      mock.onDelete('/v1/authors').reply(200);

      await expect(deleteAuthors(sampleDeleteAuthorsRequest)).resolves.toBeUndefined();
      expect(mock.history.delete).toHaveLength(1);
      expect(mock.history.delete[0].params?.toString()).toBe('ids=a6f682de-5fd4-442e-a237-71b30281a2d6&ids=6d0d5f0b-2f3a-4f9b-9f1e-2d2b3c4d5e6f');
    });

    it('returns a 5xx response on deleteAuthors', async () => {
      mock.onDelete('/v1/authors').reply(500);

      await expect(deleteAuthors(sampleDeleteAuthorsRequest)).rejects.toBeDefined();
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

    it('handles a successful usePostAuthors mutation', async () => {
      mock.onPost('/v1/authors').reply(200, samplePostAuthorResponse);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePostAuthor(), { wrapper });

      result.current.mutate(samplePostAuthorRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(samplePostAuthorResponse);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authors'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Author Jane Austen created successfully', {
        variant: 'success'
      });
    });

    it('handles a failed usePostAuthors mutation', async () => {
      mock.onPost('/v1/authors').reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePostAuthor(), { wrapper });

      result.current.mutate(samplePostAuthorRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create author'),
        { variant: 'error' }
      );
    });

    it('handles a successful useGetAuthors query', async () => {
      mock.onGet('/v1/authors').reply(200, sampleGetAuthorsResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthors(sampleGetAuthorRequest), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleGetAuthorsResponse);
    });

    it('handles a failed useGetAuthors query', async () => {
      mock.onGet('/v1/authors').reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthors(sampleGetAuthorRequest), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });

    it('handles a successful useDeleteAuthors mutation', async () => {
      mock.onDelete('/v1/authors').reply(200);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => useDeleteAuthors(), { wrapper });

      result.current.mutate(sampleDeleteAuthorsRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authors'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Deleted 2 authors successfully', {
        variant: 'success'
      });
    });

    it('handles a failed useDeleteAuthors mutation', async () => {
      mock.onDelete('/v1/authors').reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => useDeleteAuthors(), { wrapper });

      result.current.mutate(sampleDeleteAuthorsRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete authors'),
        { variant: 'error' }
      );
    });
  });
})
