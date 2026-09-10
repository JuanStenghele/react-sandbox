import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { RawBook, GetBooksRawResponse } from '../../../services/books';
import { LocationDisplay } from '../../../test/utils';
import BooksTable from './Table';

describe('BooksTable', () => {
  const mock = new MockAdapter(backend);

  const sampleRawBook: RawBook = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery.',
    isbn: '978-0135957059',
    publication_date: '2019-09-13',
    cover_image_url: 'http://localhost:8000/storage/covers/abc.jpg',
    created_at: '2026-06-25T03:28:59.552152',
  };

  const sampleRawResponse: GetBooksRawResponse = {
    books: [sampleRawBook],
    total_books: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
  };

  const emptyRawResponse: GetBooksRawResponse = {
    books: [],
    total_books: 0,
    total_pages: 0,
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
        <MemoryRouter>
          <LocationDisplay />
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders row data', async () => {
    mock.onGet('/v1/books').reply(200, sampleRawResponse);
    const wrapper = buildWrapper();

    render(<BooksTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      expect(
        screen.getByText('a6f682de-5fd4-442e-a237-71b30281a2d6')
      ).toBeInTheDocument();
      expect(screen.getByText('978-0135957059')).toBeInTheDocument();
    });
  });

  it('shows error overlay', async () => {
    mock.onGet('/v1/books').reply(500);
    const wrapper = buildWrapper();

    render(<BooksTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Error loading books')).toBeInTheDocument();
    });
  });

  it('shows no books found overlay', async () => {
    mock.onGet('/v1/books').reply(200, emptyRawResponse);
    const wrapper = buildWrapper();

    render(<BooksTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No books found')).toBeInTheDocument();
    });
  });

  describe('row click', () => {
    it('navigates to the edit book page when a row is clicked', async () => {
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const wrapper = buildWrapper();

      render(<BooksTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('The Pragmatic Programmer'));

      expect(screen.getByTestId('location')).toHaveTextContent(
        `/books/${sampleRawBook.id}`
      );
    });
  });
});
