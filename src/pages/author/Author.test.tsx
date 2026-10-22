import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { InitialEntry } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import backend from '../../services/backend';
import type { Author } from '../../types/author';
import { buildAuthProps, buildAuthUser } from '../../test/utils';
import AuthorPage from './Author';

vi.mock('react-oidc-context');

describe('AuthorPage', () => {
  const mock = new MockAdapter(backend);

  const mockedUseAuth = vi.mocked(useAuth);

  const sampleAuthor: Author = {
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen',
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

    render(<AuthorPage />, { wrapper });

    expect(screen.getByText('New Author')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows a loading spinner while an author is being fetched', async () => {
    let resolveDeferred!: (value: [number, Author]) => void;
    const deferredResponse = new Promise<[number, Author]>((resolve) => {
      resolveDeferred = resolve;
    });
    mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(() => deferredResponse);
    const wrapper = buildWrapper([`/authors/${sampleAuthor.id}`]);

    render(
      <Routes>
        <Route path='/authors/:id' element={<AuthorPage />} />
      </Routes>,
      { wrapper }
    );

    expect(screen.getByLabelText('loading-spinner')).toBeInTheDocument();

    resolveDeferred([200, sampleAuthor]);

    await waitFor(() => {
      expect(screen.getByText('Edit Author')).toBeInTheDocument();
    });
  });

  it('shows the edit author form when loaded by id', async () => {
    mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(200, sampleAuthor);
    const wrapper = buildWrapper([`/authors/${sampleAuthor.id}`]);

    render(
      <Routes>
        <Route path='/authors/:id' element={<AuthorPage />} />
      </Routes>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Author')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(sampleAuthor.name)).toBeInTheDocument();
  });

  it('shows the edit author form when loaded from state', () => {
    const wrapper = buildWrapper([
      { pathname: `/authors/${sampleAuthor.id}`, state: { author: sampleAuthor } },
    ]);

    render(
      <Routes>
        <Route path='/authors/:id' element={<AuthorPage />} />
      </Routes>,
      { wrapper }
    );

    expect(screen.getByText('Edit Author')).toBeInTheDocument();
    expect(screen.getByDisplayValue(sampleAuthor.name)).toBeInTheDocument();
    expect(mock.history.get).toHaveLength(0);
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

    it('shows the author details title for a non-admin user', async () => {
      mock.onGet(`/v1/authors/${sampleAuthor.id}`).reply(200, sampleAuthor);
      const wrapper = buildWrapper([`/authors/${sampleAuthor.id}`]);

      render(
        <Routes>
          <Route path='/authors/:id' element={<AuthorPage />} />
        </Routes>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Author Details')).toBeInTheDocument();
      });
      expect(screen.queryByText('Edit Author')).not.toBeInTheDocument();
    });
  });
});
