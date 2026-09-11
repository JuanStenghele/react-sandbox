import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import backend from '../../services/backend';
import type { RawBook, GetBooksRawResponse } from '../../services/books';
import { Provider, createStore } from 'jotai';
import type { Store } from 'jotai/vanilla/store';
import { booksTableState } from '../../state/books';
import { buildAuthProps, buildAuthUser, LocationDisplay } from '../../test/utils';
import BooksPage from './Books';

describe('BooksPage', () => {
  vi.mock('react-oidc-context');

  const mock = new MockAdapter(backend);
  const mockedUseAuth = vi.mocked(useAuth);

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

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mock.reset();
  });

  const buildWrapper = (store: Store = createStore()) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LocationDisplay />
          <Provider store={store}>
            {children}
          </Provider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('displays the title and table with data', async () => {
    const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
    );
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

  describe('new button', () => {
    it('is disabled for non-admin users', () => {
      const regularUser = buildAuthUser({ scopes: ['openid'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const wrapper = buildWrapper();

      render(<BooksPage />, { wrapper });

      expect(screen.getByRole('button', { name: 'New' })).toBeDisabled();
    });

    it('redirects to new book page for admin users', async () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const wrapper = buildWrapper();

      render(<BooksPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: 'New' }));

      expect(screen.getByTestId('location')).toHaveTextContent('/books/new');
    });
  });

  describe('search field', () => {
    it('sends the search term to the backend after the debounce delay', async () => {
      vi.useFakeTimers();
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const wrapper = buildWrapper();

      render(<BooksPage />, { wrapper });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'Pragmatic' },
      });

      expect(mock.history.get[mock.history.get.length - 1].params?.search_term).toBe('');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      const lastRequest = mock.history.get[mock.history.get.length - 1];
      expect(lastRequest.params?.search_term).toBe('Pragmatic');
    });

    it('resets to the first page when the search term changes', async () => {
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

      render(<BooksPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Book 1')).toBeInTheDocument();
      });

      await fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

      await waitFor(() => {
        expect(screen.getByText('Book 11')).toBeInTheDocument();
      });

      expect(store.get(booksTableState).page).toBe(1);

      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'x' },
      });

      await waitFor(() => {
        expect(store.get(booksTableState).page).toBe(0);
      });
      expect(store.get(booksTableState).searchTerm).toBe('x');
    });
  });
});
