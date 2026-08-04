import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../services/backend';
import type { GetAuthorsResponse } from '../../services/authors';
import AuthorsPage from './Authors';

describe('AuthorsPage', () => {
  const mock = new MockAdapter(backend);

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
});
