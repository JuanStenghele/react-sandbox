import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { Author } from '../../../types/author';
import type { GetAuthorsResponse } from '../../../services/authors';
import AuthorSelector from './AuthorSelector';

describe('AuthorSelector', () => {
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

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mock.reset();
  });

  const buildWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders the fetched authors as options', async () => {
    mock.onGet('/v1/authors').reply(200, sampleResponse);
    const wrapper = buildWrapper();

    render(<AuthorSelector width={176.0} />, { wrapper });

    await userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(
        screen.getByText('Jane Austen (a6f682de-5fd4-442e-a237-71b30281a2d6)')
      ).toBeInTheDocument();
    });
  });

  it('shows a loading indicator while authors are being fetched', async () => {
    let resolveDeferred!: (value: [number, GetAuthorsResponse]) => void;
    const deferredResponse = new Promise<[number, GetAuthorsResponse]>((resolve) => {
      resolveDeferred = resolve;
    });
    mock.onGet('/v1/authors').reply(() => deferredResponse);
    const wrapper = buildWrapper();

    render(<AuthorSelector width={176.0} />, { wrapper });

    await userEvent.click(screen.getByRole('combobox'));

    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();

    resolveDeferred([200, sampleResponse]);

    await waitFor(() => {
      expect(
        screen.getByText('Jane Austen (a6f682de-5fd4-442e-a237-71b30281a2d6)')
      ).toBeInTheDocument();
    });
  });

  it('fetches and displays the author by id when the value is not in the fetched list', async () => {
    const missingAuthor: Author = {
      id: 'missing-author-id',
      name: 'Missing Author',
    };
    mock.onGet('/v1/authors').reply(200, sampleResponse);
    mock.onGet(/\/v1\/authors\/[^/]+/).reply(200, missingAuthor);
    const wrapper = buildWrapper();

    render(<AuthorSelector width={176.0} value={missingAuthor.id} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Missing Author (missing-author-id)')
      ).toBeInTheDocument();
    });
  });

  it('keeps the fetched author as the selected option when it is later loaded in a page', async () => {
    const valueAuthor: Author = { id: 'author-11', name: 'Author 11' };
    const pageOneAuthors: Author[] = Array.from({ length: 10 }, (_, index) => ({
      id: `author-${index + 1}`,
      name: `Author ${index + 1}`,
    }));

    mock.onGet('/v1/authors').reply((config) => {
      const page = config.params?.page;
      return page === 1
        ? [200, {
            authors: pageOneAuthors,
            total_authors: 11,
            total_pages: 2,
            current_page: 1,
            page_size: 10,
          }]
        : [200, {
            authors: [valueAuthor],
            total_authors: 11,
            total_pages: 2,
            current_page: 2,
            page_size: 10,
          }];
    });
    mock.onGet(/\/v1\/authors\/[^/]+/).reply(200, valueAuthor);
    const wrapper = buildWrapper();

    render(<AuthorSelector width={176.0} value={valueAuthor.id} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Author 11 (author-11)')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByText('Author 1 (author-1)')).toBeInTheDocument();
    });

    fireEvent.scroll(screen.getByRole('listbox'));

    await waitFor(() => {
      expect(screen.getByText('Author 11 (author-11)')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Author 11 (author-11)')).toHaveLength(1);
  });

  it('sends the search term to the backend after the debounce delay', async () => {
    vi.useFakeTimers();
    mock.onGet('/v1/authors').reply(200, sampleResponse);
    const wrapper = buildWrapper();

    render(<AuthorSelector width={176.0} />, { wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Jane' },
    });

    expect(mock.history.get[mock.history.get.length - 1].params?.search_term).toBe('');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    const lastRequest = mock.history.get[mock.history.get.length - 1];
    expect(lastRequest.params?.search_term).toBe('Jane');
  });

  it('fetches the next page and shows a loading indicator when scrolled to the bottom', async () => {
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

    render(<AuthorSelector width={176.0} />, { wrapper });

    await userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByText('Author 1 (author-1)')).toBeInTheDocument();
    });

    fireEvent.scroll(screen.getByRole('listbox'));

    await waitFor(() => {
      expect(
        screen.getByRole('listbox').querySelector('.MuiCircularProgress-root')
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
      expect(screen.getByText('Author 11 (author-11)')).toBeInTheDocument();
    });
  });
});
