import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { InitialEntry } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import backend from '../../services/backend';
import type { Book } from '../../types/book';
import type { RawBook } from '../../services/books';
import { buildAuthProps, buildAuthUser } from '../../test/utils';
import BookPage from './Book';

vi.mock('react-oidc-context');

describe('BookPage', () => {
  const mock = new MockAdapter(backend);

  const mockedUseAuth = vi.mocked(useAuth);

  const sampleRawBook: RawBook = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    publication_date: '2019-09-13',
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg',
    created_at: '2026-06-25T03:28:59.552152',
  };

  const sampleBook: Book = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    publication_date: new Date('2019-09-13'),
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg',
    created_at: new Date('2026-06-25T03:28:59.552152'),
  };

  beforeEach(() => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({
        isAuthenticated: true,
        isLoading: false,
        user: buildAuthUser({ permissions: ['admin'] })
      })
    );
  });

  afterEach(() => {
    mock.reset();
    vi.clearAllMocks();
  });

  const buildWrapper = (initialEntries?: InitialEntry[]) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('displays the title and form', () => {
    const wrapper = buildWrapper();

    render(<BookPage />, { wrapper });

    expect(screen.getByText('New Book')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows a loading spinner while a book is being fetched', async () => {
    let resolveDeferred!: (value: [number, RawBook]) => void;
    const deferredResponse = new Promise<[number, RawBook]>((resolve) => {
      resolveDeferred = resolve;
    });
    mock.onGet(`/v1/books/${sampleBook.id}`).reply(() => deferredResponse);
    const wrapper = buildWrapper([`/books/${sampleBook.id}`]);

    render(
      <Routes>
        <Route path='/books/:id' element={<BookPage />} />
      </Routes>,
      { wrapper }
    );

    expect(screen.getByLabelText('loading-spinner')).toBeInTheDocument();

    resolveDeferred([200, sampleRawBook]);

    await waitFor(() => {
      expect(screen.getByText('Edit Book')).toBeInTheDocument();
    });
  });

  it('shows the edit book form when loaded by id', async () => {
    mock.onGet(`/v1/books/${sampleBook.id}`).reply(200, sampleRawBook);
    const wrapper = buildWrapper([`/books/${sampleBook.id}`]);

    render(
      <Routes>
        <Route path='/books/:id' element={<BookPage />} />
      </Routes>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Book')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(sampleBook.title)).toBeInTheDocument();
  });

  it('shows the edit book form when loaded from state', () => {
    const wrapper = buildWrapper([
      { pathname: `/books/${sampleBook.id}`, state: { book: sampleBook } },
    ]);

    render(
      <Routes>
        <Route path='/books/:id' element={<BookPage />} />
      </Routes>,
      { wrapper }
    );

    expect(screen.getByText('Edit Book')).toBeInTheDocument();
    expect(screen.getByDisplayValue(sampleBook.title)).toBeInTheDocument();
    expect(
      mock.history.get.filter((request) => request.url?.includes(`/v1/books/${sampleBook.id}`))
    ).toHaveLength(0);
  });

  describe('view mode', () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue(
        buildAuthProps({
          isAuthenticated: true,
          isLoading: false,
          user: buildAuthUser({ permissions: [] })
        })
      );
    });

    it('shows the book details title for a non-admin user', async () => {
      mock.onGet(`/v1/books/${sampleBook.id}`).reply(200, sampleRawBook);
      const wrapper = buildWrapper([`/books/${sampleBook.id}`]);

      render(
        <Routes>
          <Route path='/books/:id' element={<BookPage />} />
        </Routes>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Book Details')).toBeInTheDocument();
      });
      expect(screen.queryByText('Edit Book')).not.toBeInTheDocument();
    });
  });
});
