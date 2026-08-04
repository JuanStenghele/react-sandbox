import { describe, it, expect, afterEach } from 'vitest'
import backend from './backend';
import MockAdapter from 'axios-mock-adapter';
import type { Author } from '../types/author';
import type { GetAuthorsResponse } from './authors';
import { getAuthors, useGetAuthors } from './authors';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

describe('authors service', () => {
  const sampleAuthor: Author = { 
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen',
  }
  const sampleResponse: GetAuthorsResponse = {
    authors: [sampleAuthor],
    total_authors: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10
  }

  const sampleRequestParams = { search_term: '', page: 1, page_size: 10 };

  const mock = new MockAdapter(backend);

  afterEach(() => {
    mock.reset();
  });

  describe('request', () => {
    it('returns a successful response', async () => {
      mock.onGet('/v1/authors').reply(200, sampleResponse);

      const response = await getAuthors(sampleRequestParams);

      expect(response).toEqual(sampleResponse);
    });

    it('returns a 5xx response', async () => {
      mock.onGet('/v1/authors').reply(500);

      await expect(getAuthors(sampleRequestParams)).rejects.toBeDefined();
    });
  });

  describe('hooks', () => {
    const buildWrapper = () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          { children }
        </QueryClientProvider>
      );
    };

    it('handles a successful query', async () => {
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthors(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleResponse);
    });

    it('handles a failed query', async () => {
      mock.onGet('/v1/authors').reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetAuthors(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });
  });
})
