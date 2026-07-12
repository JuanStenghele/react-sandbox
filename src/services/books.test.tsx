import { describe, it, expect, afterEach } from 'vitest'
import api from "./api";
import MockAdapter from "axios-mock-adapter";
import type { GetBooksResponse } from './books';
import { getBooks, useGetBooks } from './books';
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Book } from '../types/book';

describe('books service', () => {
  const sampleBook: Book = { 
    id: "60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd",
    title: "The Pragmatic Programmer",
    author_id: "a6f682de-5fd4-442e-a237-71b30281a2d6",
    description: "Your journey to mastery, 20th anniversary edition.",
    isbn: "978-0135957059",
    publication_date: "2019-09-13",
    cover_image_url: "http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg",
    created_at: "2026-06-25T03:28:59.552152"
  }
  const sampleResponse: GetBooksResponse = {
    books: [sampleBook],
    total_books: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10
  }

  const sampleRequestParams = { search_term: "", page: 1, page_size: 10 };

  const mock = new MockAdapter(api);

  afterEach(() => {
    mock.reset();
  });

  describe('request', () => {
    it('returns a successful response', async () => {
      mock.onGet("/v1/books").reply(200, sampleResponse);

      const response = await getBooks(sampleRequestParams);

      expect(response).toEqual(sampleResponse);
    });

    it('returns a 5xx response', async () => {
      mock.onGet("/v1/books").reply(500);

      await expect(getBooks(sampleRequestParams)).rejects.toBeDefined();
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
      mock.onGet("/v1/books").reply(200, sampleResponse);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBooks(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.data).toEqual(sampleResponse);
    });

    it('handles a failed query', async () => {
      mock.onGet("/v1/books").reply(500);
      const wrapper = buildWrapper();

      const { result } = renderHook(() => useGetBooks(sampleRequestParams), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toBeDefined();
    });
  });
})
