import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import backend from './backend';
import MockAdapter from 'axios-mock-adapter';
import type { Author } from '../types/author';
import type { DeleteAuthorsRequest, GetAuthorsResponse, PatchAuthorRequest, PatchAuthorResponse, PostAuthorResponse } from './authors';
import { postAuthor, usePostAuthor, getAuthors, useGetAuthors, getAuthor, useGetAuthor, useGetInfiniteAuthors, patchAuthor, usePatchAuthor, deleteAuthors, useDeleteAuthors } from './authors';
import { act, renderHook, waitFor } from '@testing-library/react';
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
  const samplePatchAuthorResponse: PatchAuthorResponse = sampleAuthor;

  const samplePostAuthorRequest = { name: sampleAuthor.name };
  const sampleGetAuthorRequest = { search_term: '', page: 1, page_size: 10 };
  const sampleDeleteAuthorsRequest: DeleteAuthorsRequest = { ids: ['a6f682de-5fd4-442e-a237-71b30281a2d6', '6d0d5f0b-2f3a-4f9b-9f1e-2d2b3c4d5e6f'] };
  const samplePatchAuthorRequest: { id: string; data: PatchAuthorRequest } = { id: sampleAuthor.id, data: { name: sampleAuthor.name } };

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

    it('returns a successful response on getAuthor', async () => {
      mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(200, sampleAuthor);

      const response = await getAuthor(sampleAuthor.id);

      expect(response).toEqual(sampleAuthor);
    });

    it('returns a 5xx response on getAuthor', async () => {
      mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(500);

      await expect(getAuthor(sampleAuthor.id)).rejects.toBeDefined();
    });

    it('returns a successful response on patchAuthor', async () => {
      mock.onPatch(`/v1/authors/${sampleAuthor.id}`).reply(200, samplePatchAuthorResponse);

      const response = await patchAuthor(samplePatchAuthorRequest.id, samplePatchAuthorRequest.data);

      expect(response).toEqual(samplePatchAuthorResponse);
    });

    it('returns a 5xx response on patchAuthor', async () => {
      mock.onPatch(`/v1/authors/${sampleAuthor.id}`).reply(500);

      await expect(patchAuthor(samplePatchAuthorRequest.id, samplePatchAuthorRequest.data)).rejects.toBeDefined();
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

    it('handles a successful useGetAuthor query', async () => {
      mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(200, sampleAuthor);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthor(sampleAuthor.id), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleAuthor);
    });

    it('handles a failed useGetAuthor query', async () => {
      mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthor(sampleAuthor.id), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });

    it('does not fetch when enabled is false', () => {
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthor(sampleAuthor.id, false), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mock.history.get).toHaveLength(0);
    });

    it('does not fetch when id is undefined', () => {
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthor(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mock.history.get).toHaveLength(0);
    });

    it('handles a successful useGetInfiniteAuthors query', async () => {
      mock.onGet('/v1/authors').reply(200, sampleGetAuthorsResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetInfiniteAuthors({ search_term: '', page_size: 10 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.data?.pages[0].authors).toEqual([sampleAuthor]);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('handles a failed useGetInfiniteAuthors query', async () => {
      mock.onGet('/v1/authors').reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetInfiniteAuthors({ search_term: '', page_size: 10 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });

    it('fetches the next page when useGetInfiniteAuthors has more pages', async () => {
      const pageOneAuthors: Author[] = Array.from({ length: 10 }, (_, index) => ({
        id: `author-${index + 1}`,
        name: `Author ${index + 1}`,
      }));
      const pageTwoAuthors: Author[] = [{ id: 'author-11', name: 'Author 11' }];
      const totalAuthors = pageOneAuthors.length + pageTwoAuthors.length;

      mock.onGet('/v1/authors').reply((config) => {
        const page = config.params?.page;
        return page === 1
          ? [200, {
              authors: pageOneAuthors,
              total_authors: totalAuthors,
              total_pages: 2,
              current_page: 1,
              page_size: 10,
            }]
          : [200, {
              authors: pageTwoAuthors,
              total_authors: totalAuthors,
              total_pages: 2,
              current_page: 2,
              page_size: 10,
            }];
      });

      const wrapper = buildWrapper();
      const { result } = renderHook(() => useGetInfiniteAuthors({ search_term: '', page_size: 10 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.hasNextPage).toBe(true);

      await act(async () => {
        await result.current.fetchNextPage();
      });

      await waitFor(() => {
        expect(result.current.data?.pages).toHaveLength(2);
      });
      expect(result.current.data?.pages[1].authors).toEqual(pageTwoAuthors);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('sends the search term when fetching infinite authors', async () => {
      mock.onGet('/v1/authors').reply(200, sampleGetAuthorsResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetInfiniteAuthors({ search_term: 'Jane', page_size: 10 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mock.history.get[0].params?.search_term).toBe('Jane');
      expect(mock.history.get[0].params?.page).toBe(1);
      expect(mock.history.get[0].params?.page_size).toBe(10);
    });

    it('handles a successful usePatchAuthor mutation', async () => {
      mock.onPatch(`/v1/authors/${sampleAuthor.id}`).reply(200, samplePatchAuthorResponse);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePatchAuthor(), { wrapper });

      result.current.mutate(samplePatchAuthorRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(samplePatchAuthorResponse);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['authors'] });
      expect(enqueueSnackbar).toHaveBeenCalledWith('Author Jane Austen updated successfully', {
        variant: 'success'
      });
    });

    it('handles a failed usePatchAuthor mutation', async () => {
      mock.onPatch(`/v1/authors/${sampleAuthor.id}`).reply(500);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = buildWrapper(queryClient);

      const { result } = renderHook(() => usePatchAuthor(), { wrapper });

      result.current.mutate(samplePatchAuthorRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
      expect(invalidateQueriesSpy).not.toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update author'),
        { variant: 'error' }
      );
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
