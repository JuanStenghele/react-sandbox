import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, createStore } from 'jotai';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { Author } from '../../../types/author';
import type { GetAuthorsResponse } from '../../../services/authors';
import { selectedAuthorRowsIds } from '../../../state/authors';
import { LocationDisplay } from '../../../test/utils';
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

  it('shows a loading indicator while fetching the next page', async () => {
    const pageOneAuthors: Author[] = Array.from({ length: 10 }, (_, index) => ({
      id: `author-${index + 1}`,
      name: `Author ${index + 1}`,
    }));
    const pageTwoAuthors: Author[] = [{ id: 'author-11', name: 'Author 11' }];
    const totalAuthors = pageOneAuthors.length + pageTwoAuthors.length;

    let resolveDeferred!: (value: [number, GetAuthorsResponse]) => void;
    const deferredResponse = new Promise<[number, GetAuthorsResponse]>((resolve) => {
      resolveDeferred = resolve;
    });

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
        : deferredResponse;
    });

    const wrapper = buildWrapper();

    const { container } = render(<AuthorsTable />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Author 1')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

    await waitFor(() => {
      expect(
        container.querySelector('.MuiDataGrid-skeletonLoadingOverlay')
      ).toBeInTheDocument();
    });

    resolveDeferred([200, {
      authors: pageTwoAuthors,
      total_authors: totalAuthors,
      total_pages: 2,
      current_page: 2,
      page_size: 10,
    }]);

    await waitFor(() => {
      expect(screen.getByText('Author 11')).toBeInTheDocument();
    });

    expect(
      container.querySelector('.MuiDataGrid-skeletonLoadingOverlay')
    ).not.toBeInTheDocument();
  });

  describe('row selection', () => {
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

    it('selects only the rows on the current page when selecting all', async () => {
      const pageOneAuthors: Author[] = Array.from({ length: 10 }, (_, index) => ({
        id: `author-${index + 1}`,
        name: `Author ${index + 1}`,
      }));
      const pageTwoAuthors: Author[] = [{ id: 'author-11', name: 'Author 11' }];
      const totalAuthors = pageOneAuthors.length + pageTwoAuthors.length;

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

      render(<AuthorsTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Author 1')).toBeInTheDocument();
      });

      await userEvent.click(screen.getAllByRole('checkbox')[0]);

      expect(store.get(selectedAuthorRowsIds)).toEqual(
        new Set(pageOneAuthors.map((author) => author.id))
      );

      await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

      await waitFor(() => {
        expect(screen.getByText('Author 11')).toBeInTheDocument();
      });

      expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
    });
  });

  describe('row click', () => {
    it('navigates to the edit author page when a row is clicked', async () => {
      mock.onGet('/v1/authors').reply(200, sampleResponse);
      const wrapper = buildWrapper();

      render(<AuthorsTable />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Jane Austen'));

      expect(screen.getByTestId('location')).toHaveTextContent(
        `/authors/${sampleAuthor.id}`
      );
    });
  });
});
