import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BookForm from './Form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { LocationDisplay } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import backend from '../../services/backend';
import type { PostBookResponse } from '../../services/books';

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

  const dummyFile = new File(['data'], 'hello.png', { type: 'image/png' });

  const selectCoverImage = async () => {
    const input = screen.getByLabelText('Cover image input') as HTMLInputElement;
    await userEvent.upload(input, dummyFile);
  };

  it('successfully creates a new book', async () => {
    mock.onPost('/v1/books').reply(200, sampleResponse);
    const wrapper = buildBookFormWrapper();

    render(<BookForm />, { wrapper });

    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'The Pragmatic Programmer');
    await userEvent.type(screen.getByRole('textbox', { name: 'ISBN' }), '978-0135957059');
    await userEvent.type(screen.getByRole('textbox', { name: 'Description' }), 'Your journey to mastery, 20th anniversary edition.');
    await selectCoverImage();

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);

      const formData = mock.history.post[0].data as FormData;
      expect(formData.get('title')).toBe('The Pragmatic Programmer');
      expect(formData.get('isbn')).toBe('978-0135957059');
      expect(formData.get('publication_date')).toBe(new Date().toISOString().split('T')[0]);
      expect(formData.get('description')).toBe('Your journey to mastery, 20th anniversary edition.');
      expect(formData.get('author_id')).toBe('');
      expect(formData.get('cover_image')).toEqual(dummyFile);

      expect(screen.getByTestId('location')).toHaveTextContent('/books');
    });
  });
});
