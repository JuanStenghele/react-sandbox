import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../services/backend';
import type { GetBooksRawResponse } from '../../services/books';
import BooksPage from './Books';

describe('BooksPage', () => {
  const mock = new MockAdapter(backend);

  const sampleRawResponse: GetBooksRawResponse = {
    books: [
      {
        id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
        title: 'The Pragmatic Programmer',
        author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
        description: 'Your journey to mastery.',
        isbn: '978-0135957059',
        publication_date: '2019-09-13',
        cover_image_url: 'http://localhost:8000/storage/covers/abc.jpg',
        created_at: '2026-06-25T03:28:59.552152',
      },
    ],
    total_books: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
  };

  afterEach(() => {
    mock.reset();
  });

  const buildWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  it('displays the title and table with data', async () => {
    mock.onGet('/v1/books').reply(200, sampleRawResponse);
    const wrapper = buildWrapper();

    render(<BooksPage />, { wrapper });

    expect(screen.getByText('Books')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('The Pragmatic Programmer')
      ).toBeInTheDocument();
    });
  });
});
