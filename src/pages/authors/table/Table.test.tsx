import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, createStore } from 'jotai';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { Author } from '../../../types/author';
import type { GetAuthorsResponse } from '../../../services/authors';
import { selectedAuthorRowsIds } from '../../../state/authors';
import AuthorsTable from './Table';
import type { Store } from 'jotai/vanilla/store';

describe('AuthorsTable', () => {
  const mock = new MockAdapter(backend);

  const sampleAuthor: Author = {
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen',
  };

  const sampleResponse: GetAuthorsResponse = {
    authors: [sampleAuthor],
    total_authors: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10,
  };

  const emptyResponse: GetAuthorsResponse = {
    authors: [],
    total_authors: 0,
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
        {children}
      </QueryClientProvider>
    );
  };

  it('renders row data', async () => {
    mock.onGet('/v1/authors').reply(200, sampleResponse);
    const wrapper = buildWrapper();

    render(<AuthorsTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      expect(
        screen.getByText('a6f682de-5fd4-442e-a237-71b30281a2d6')
      ).toBeInTheDocument();
    });
  });

  it('shows error overlay', async () => {
    mock.onGet('/v1/authors').reply(500);
    const wrapper = buildWrapper();

    render(<AuthorsTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Error loading authors')).toBeInTheDocument();
    });
  });

  it('shows no authors found overlay', async () => {
    mock.onGet('/v1/authors').reply(200, emptyResponse);
    const wrapper = buildWrapper();

    render(<AuthorsTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No authors found')).toBeInTheDocument();
    });
  });

  describe('row selection', () => {
    const buildWrapper = (store: Store) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            {children}
          </Provider>
        </QueryClientProvider>
      );
    };

    it('stores the selected row id when a row is included', async () => {
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<AuthorsTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      });

      const rowCheckbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(rowCheckbox);

      expect(store.get(selectedAuthorRowsIds)).toEqual(
        new Set([sampleAuthor.id])
      );
    });

    it('removes the deselected row id from the shown ids when a row is excluded', async () => {
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const store = createStore();
      const wrapper = buildWrapper(store);

      render(<AuthorsTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      });

      const [selectAllCheckbox, rowCheckbox] = screen.getAllByRole('checkbox');

      await userEvent.click(selectAllCheckbox);
      expect(store.get(selectedAuthorRowsIds)).toEqual(
        new Set([sampleAuthor.id])
      );

      await userEvent.click(rowCheckbox);
      expect(store.get(selectedAuthorRowsIds)).toEqual(new Set());
    });
  });
});
