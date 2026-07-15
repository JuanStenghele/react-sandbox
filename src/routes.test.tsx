import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps } from './test/utils';
import backend from './services/backend';
import type { GetBooksRawResponse } from './services/books';
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
});
