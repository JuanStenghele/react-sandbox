import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { RawBook, GetBooksRawResponse } from '../../../services/books';
import { Provider, createStore } from 'jotai';
import type { Store } from 'jotai/vanilla/store';
import { booksTableState } from '../../../state/books';
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

  const buildWrapper = (store?: Store) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LocationDisplay />
          {store ? (
            <Provider store={store}>{children}</Provider>
          ) : (
            children
          )}
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

  describe('row selection', () => {
    it('stores the selected row id when a row is included', async () => {
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<BooksTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      });

      const rowCheckbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(rowCheckbox);

      expect(store.get(booksTableState).selectedRowsIds).toEqual(
        new Set([sampleRawBook.id])
      );
    });

    it('removes the deselected row id from the shown ids when a row is excluded', async () => {
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<BooksTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      });

      const [selectAllCheckbox, rowCheckbox] = screen.getAllByRole('checkbox');

      await userEvent.click(selectAllCheckbox);
      expect(store.get(booksTableState).selectedRowsIds).toEqual(
        new Set([sampleRawBook.id])
      );

      await userEvent.click(rowCheckbox);
      expect(store.get(booksTableState).selectedRowsIds).toEqual(new Set());
    });

    it('selects only the rows on the current page when selecting all', async () => {
      const pageOneBooks: RawBook[] = Array.from({ length: 10 }, (_, index) => ({
        id: `book-${index + 1}`,
        title: `Book ${index + 1}`,
        author_id: `author-${index + 1}`,
        description: null,
        isbn: null,
        publication_date: null,
        cover_image_url: null,
        created_at: '2026-06-25T03:28:59.552152',
      }));
      const pageTwoBooks: RawBook[] = [{
        id: 'book-11',
        title: 'Book 11',
        author_id: 'author-11',
        description: null,
        isbn: null,
        publication_date: null,
        cover_image_url: null,
        created_at: '2026-06-25T03:28:59.552152',
      }];
      const totalBooks = pageOneBooks.length + pageTwoBooks.length;

      mock.onGet('/v1/books').reply((config) => {
        const page = config.params?.page;
        return page === 1
          ? [200, {
              books: pageOneBooks,
              total_books: totalBooks,
              total_pages: 2,
              current_page: 1,
              page_size: 10,
            }]
          : [200, {
              books: pageTwoBooks,
              total_books: totalBooks,
              total_pages: 2,
              current_page: 2,
              page_size: 10,
            }];
      });

      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<BooksTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Book 1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getAllByRole('checkbox')[0]);

      expect(store.get(booksTableState).selectedRowsIds).toEqual(
        new Set(pageOneBooks.map((book) => book.id))
      );

      await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

      await waitFor(() => {
        expect(screen.getByText('Book 11')).toBeInTheDocument();
      });

      expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
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
