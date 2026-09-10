import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps, buildAuthUser } from './test/utils';
import backend from './services/backend';
import type { GetBooksRawResponse, RawBook } from './services/books';
import type { GetAuthorsResponse } from './services/authors';
import AppRoutes from './routes';

vi.mock('react-oidc-context');

describe('AppRoutes', () => {
  const mock = new MockAdapter(backend);

  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
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

  it.each([[true], [false]])('shows not found page when route is not known', (isAuthenticated: boolean) => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated, isLoading: false })
    );

    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  describe('books routes', () => {
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
      page_size: 10
    };

    it.each([['/'], ['/books']])('renders books page', async (route) => {
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false })
      );
      mock.onGet('/v1/books').reply(200, sampleRawResponse);
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      });
    });
  });

  describe('authors routes', () => {
    const sampleResponse: GetAuthorsResponse = {
      authors: [
        {
          id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
          name: 'Jane Austen',
        },
      ],
      total_authors: 1,
      total_pages: 1,
      current_page: 1,
      page_size: 10,
    };

    it('renders authors page', async () => {
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false })
      );
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={['/authors']}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      });
    });

    it('renders new author page for an admin user', async () => {
      const adminUser = buildAuthUser({ scope: 'openid admin' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={['/authors/new']}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('New Author')).toBeInTheDocument();
      });
    });

    it('renders edit author page for an admin user', async () => {
      const adminUser = buildAuthUser({ scope: 'openid admin' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const author = sampleResponse.authors[0];
      mock.onGet(`/v1/authors/${author.id}`).reply(200, author);
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={[`/authors/${author.id}`]}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Author')).toBeInTheDocument();
      });
    });

    it('redirects to unauthorized page for a non-admin user', async () => {
      const regularUser = buildAuthUser({ scope: 'openid' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={['/authors/new']}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('redirects a non-admin user to the unauthorized page for the edit author route', async () => {
      const regularUser = buildAuthUser({ scope: 'openid' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={[`/authors/${sampleResponse.authors[0].id}`]}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });
  });

  describe('book routes', () => {
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

    it('renders new book page for an admin user', async () => {
      const adminUser = buildAuthUser({ scope: 'openid admin' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={['/books/new']}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('New Book')).toBeInTheDocument();
      });
    });

    it('renders edit book page for an admin user', async () => {
      const adminUser = buildAuthUser({ scope: 'openid admin' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      mock.onGet(`/v1/books/${sampleRawBook.id}`).reply(200, sampleRawBook);
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={[`/books/${sampleRawBook.id}`]}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Book')).toBeInTheDocument();
      });
    });

    it('redirects a non-admin user to the unauthorized page for the new book route', async () => {
      const regularUser = buildAuthUser({ scope: 'openid' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={['/books/new']}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });

    it('redirects a non-admin user to the unauthorized page for the edit book route', async () => {
      const regularUser = buildAuthUser({ scope: 'openid' });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const wrapper = buildWrapper();

      render(
        <MemoryRouter initialEntries={[`/books/${sampleRawBook.id}`]}>
          <AppRoutes />
        </MemoryRouter>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      });
    });
  });
});
