import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import { Provider, createStore } from 'jotai';
import type { Store } from 'jotai/vanilla/store';
import { buildAuthProps, buildAuthUser, LocationDisplay } from '../../test/utils';
import backend from '../../services/backend';
import type { GetAuthorsResponse } from '../../services/authors';
import type { Author } from '../../types/author';
import { authorsTableState } from '../../state/authors';
import AuthorsPage from './Authors';

vi.mock('react-oidc-context');

describe('AuthorsPage', () => {
  const mock = new MockAdapter(backend);
  const mockedUseAuth = vi.mocked(useAuth);

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

  afterEach(() => {
    vi.clearAllMocks();
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
    mock.onGet('/v1/authors').reply(200, sampleResponse);
    const wrapper = buildWrapper();

    render(<AuthorsPage />, { wrapper });

    expect(screen.getByText('Authors')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('Jane Austen')
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

      render(<AuthorsPage />, { wrapper });

      expect(screen.getByRole('button', { name: 'New' })).toBeDisabled();
    });

    it('redirects to new author page for admin users', async () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const wrapper = buildWrapper();

      render(<AuthorsPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: 'New' }));

      expect(screen.getByTestId('location')).toHaveTextContent('/authors/new');
    });
  });

  describe('delete button', () => {
    it('is disabled for non admin users', () => {
      const regularUser = buildAuthUser({ scopes: ['openid'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
      );
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<AuthorsPage />, { wrapper });

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    it('is disabled when no rows are selected', () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<AuthorsPage />, { wrapper });

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });

    it('shows a loading spinner on the Delete button while deleting', async () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      let resolveDeferred!: (value: [number]) => void;
      const deferredResponse = new Promise<[number]>((resolve) => {
        resolveDeferred = resolve;
      });
      mock.onDelete('/v1/authors').reply(() => deferredResponse);
      const store = createStore();
      store.set(authorsTableState, {
        searchTerm: '',
        page: 0,
        pageSize: 10,
        selectedRowsIds: new Set([sampleResponse.authors[0].id]),
      });
      const wrapper = buildWrapper(store);

      render(<AuthorsPage />, { wrapper });

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();

      await userEvent.click(deleteButton);

      expect(deleteButton.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();

      resolveDeferred([200]);

      await waitFor(() => {
        expect(deleteButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
      });
    });

    it('deletes the selected authors for admin users', async () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      mock.onDelete('/v1/authors').reply(200);
      const store = createStore();
      store.set(authorsTableState, {
        searchTerm: '',
        page: 0,
        pageSize: 10,
        selectedRowsIds: new Set([sampleResponse.authors[0].id]),
      });
      const wrapper = buildWrapper(store);

      render(<AuthorsPage />, { wrapper });

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(mock.history.delete).toHaveLength(1);
      });
      expect(mock.history.delete[0].params?.toString()).toBe(
        `ids=${sampleResponse.authors[0].id}`
      );
    });
  });

  describe('search field', () => {
    it('sends the search term to the backend', async () => {
      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const wrapper = buildWrapper();

      render(<AuthorsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByPlaceholderText('Search...'), 'Jane');

      await waitFor(() => {
        const lastRequest = mock.history.get[mock.history.get.length - 1];
        expect(lastRequest.params?.search_term).toBe('Jane');
      });
    });

    it('resets to the first page when the search term changes', async () => {
      const pageOneAuthors: Author[] = Array.from({ length: 10 }, (_, index) => ({
        id: `author-${index + 1}`,
        name: `Author ${index + 1}`,
      }));
      const pageTwoAuthors: Author[] = [{ id: 'author-11', name: 'Author 11' }];
      const totalAuthors = pageOneAuthors.length + pageTwoAuthors.length;

      const adminUser = buildAuthUser({ scopes: ['openid', 'admin'] });
      mockedUseAuth.mockReturnValue(
        buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
      );

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

      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<AuthorsPage />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Author 1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

      await waitFor(() => {
        expect(screen.getByText('Author 11')).toBeInTheDocument();
      });

      expect(store.get(authorsTableState).page).toBe(1);

      await userEvent.type(screen.getByPlaceholderText('Search...'), 'x');

      await waitFor(() => {
        expect(store.get(authorsTableState).page).toBe(0);
      });
      expect(store.get(authorsTableState).searchTerm).toBe('x');
    });
  });
});
