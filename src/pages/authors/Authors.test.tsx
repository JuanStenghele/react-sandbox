import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps, buildAuthUser, LocationDisplay } from '../../test/utils';
import backend from '../../services/backend';
import type { GetAuthorsResponse } from '../../services/authors';
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
});
