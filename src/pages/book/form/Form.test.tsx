import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BookForm from './Form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { LocationDisplay } from '../../../test/utils';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../../services/backend';
import type { PostBookResponse } from '../../../services/books';
import type { GetAuthorsResponse } from '../../../services/authors';
import type { Book } from '../../../types/book';
import type { Author } from '../../../types/author';

describe('BookForm', () => {
  const mock = new MockAdapter(backend);

  afterEach(() => {
    mock.reset();
  });

  const buildBookFormWrapper = () => {
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

  const sampleResponse: PostBookResponse = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer'
  };

  const sampleBook: Book = {
    id: '60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd',
    title: 'The Pragmatic Programmer',
    author_id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    description: 'Your journey to mastery, 20th anniversary edition.',
    isbn: '978-0135957059',
    publication_date: new Date('2019-09-13'),
    cover_image_url: 'http://localhost:8000/storage/user-content/cover-images/60fd6e8e-9e00-4e84-ad28-8d2fdd3d0ddd.jpg',
    created_at: new Date('2026-06-25T03:28:59.552152')
  };

  const sampleAuthor: Author = {
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen'
  };

  const sampleAuthorsResponse: GetAuthorsResponse = {
    authors: [sampleAuthor],
    total_authors: 1,
    total_pages: 1,
    current_page: 1,
    page_size: 10
  };

  const dummyFile = new File(['data'], 'hello.png', { type: 'image/png' });

  const selectCoverImage = async () => {
    const input = screen.getByLabelText('Cover image input') as HTMLInputElement;
    await userEvent.upload(input, dummyFile);
  };

  const selectAuthor = async () => {
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText(`${sampleAuthor.name} (${sampleAuthor.id})`));
  };

  const selectPublicationDate = async () => {
    const monthInput = screen.getByRole('spinbutton', { name: 'Month' });
    const dayInput = screen.getByRole('spinbutton', { name: 'Day' });
    const yearInput = screen.getByRole('spinbutton', { name: 'Year' });

    await userEvent.click(dayInput);
    await userEvent.clear(dayInput);
    await userEvent.type(dayInput, '10');

    await userEvent.click(monthInput);
    await userEvent.clear(monthInput);
    await userEvent.type(monthInput, '9');

    await userEvent.click(yearInput);
    await userEvent.clear(yearInput);
    await userEvent.type(yearInput, '2019');
  };

  it('renders the form with Title field and action buttons', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not show the ID field when creating a book', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument();
  });

  it('disables the Save button when the title is empty', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('redirects to books page when clicking the Cancel button', async () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/books');
  });

  it('shows a loading spinner on the Save button while submitting', async () => {
    let resolveDeferred!: (value: [number, PostBookResponse]) => void;
    const deferredResponse = new Promise<[number, PostBookResponse]>((resolve) => {
      resolveDeferred = resolve;
    });
    mock.onPost('/v1/books').reply(() => deferredResponse);
    mock.onGet('/v1/authors').reply(200, sampleAuthorsResponse);
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'The Pragmatic Programmer');
    await selectAuthor();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();

    await userEvent.click(saveButton);

    expect(saveButton.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveDeferred([200, sampleResponse]);

    await waitFor(() => {
      expect(saveButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });

  it('successfully creates a new book', async () => {
    mock.onPost('/v1/books').reply(200, sampleResponse);
    mock.onGet('/v1/authors').reply(200, sampleAuthorsResponse);
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'The Pragmatic Programmer');
    await userEvent.type(screen.getByRole('textbox', { name: 'ISBN' }), '978-0135957059');
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Your journey to mastery, 20th anniversary edition.');
    await selectAuthor();
    await selectPublicationDate();
    await selectCoverImage();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);

      const formData = mock.history.post[0].data as FormData;
      expect(formData.get('title')).toBe('The Pragmatic Programmer');
      expect(formData.get('isbn')).toBe('978-0135957059');
      expect(formData.get('publication_date')).toBe('2019-09-10');
      expect(formData.get('description')).toBe('Your journey to mastery, 20th anniversary edition.');
      expect(formData.get('author_id')).toBe(sampleAuthor.id);
      expect(formData.get('cover_image')).toEqual(dummyFile);

      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });

  it('renders a disabled ID field and prefilled fields in edit mode', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    expect(screen.getByLabelText('ID')).toBeDisabled();
    expect(screen.getByDisplayValue(sampleBook.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(sampleBook.isbn!)).toBeInTheDocument();
    expect(screen.getByDisplayValue(sampleBook.description!)).toBeInTheDocument();
  });

  it('displays the prefilled publication date in dd/MM/yyyy format in edit mode', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent('13');
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveTextContent('09');
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveTextContent('2019');
  });

  it('disables the Save button when no changes are made in edit mode', () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables the Save button when the book has no cover image and no changes are made in edit mode', () => {
    const bookWithoutCover = { ...sampleBook, cover_image_url: null };
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={bookWithoutCover} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables the Save button when the existing cover image is deleted in edit mode', async () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    await userEvent.click(screen.getByTestId('delete-cover-image'));

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });

  it('re-disables the Save button when the cover image is restored after deletion', async () => {
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    await userEvent.click(screen.getByTestId('delete-cover-image'));
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeEnabled();

    await userEvent.click(screen.getByTestId('reset-cover-image'));

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('deletes the existing cover image and redirects when the user removes it in edit mode', async () => {
    mock.onDelete(`/v1/books/${sampleBook.id}/cover-images`).reply(204);
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    await userEvent.click(screen.getByTestId('delete-cover-image'));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.delete.length).toBe(1);
      expect(mock.history.delete[0].url).toBe(`/v1/books/${sampleBook.id}/cover-images`);
      expect(mock.history.patch.length).toBe(0);

      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });

  it('does not delete the cover when a new cover image is selected in edit mode', async () => {
    mock.onPatch(`/v1/books/${sampleBook.id}`).reply(200, sampleBook);
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={sampleBook} />, { wrapper });

    await selectCoverImage();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.patch.length).toBe(1);

      const formData = mock.history.patch[0].data as FormData;
      expect(formData.get('cover_image')).toEqual(dummyFile);

      expect(mock.history.delete.length).toBe(0);
      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });

  it('submits via PATCH without deleting the cover when the book has no cover image in edit mode', async () => {
    const bookWithoutCover = { ...sampleBook, cover_image_url: null };
    mock.onPatch(`/v1/books/${bookWithoutCover.id}`).reply(200, bookWithoutCover);
    const wrapper = buildBookFormWrapper();

    render(<BookForm book={bookWithoutCover} />, { wrapper });

    const titleField = screen.getByRole('textbox', { name: 'Title' });
    await userEvent.clear(titleField);
    await userEvent.type(titleField, 'Updated title');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.patch.length).toBe(1);
      expect(mock.history.delete.length).toBe(0);
      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });
});
