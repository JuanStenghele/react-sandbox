import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { useAuth } from 'react-oidc-context';
import backend from '../../services/backend';
import type { PostAuthorResponse } from '../../services/authors';
import type { Author } from '../../types/author';
import { LocationDisplay, buildAuthProps, buildAuthUser } from '../../test/utils';
import AuthorForm from './Form';

vi.mock('react-oidc-context');

describe('AuthorForm', () => {
  const mock = new MockAdapter(backend);

  const mockedUseAuth = vi.mocked(useAuth);

  const sampleResponse: PostAuthorResponse = {
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen'
  };

  const sampleAuthor: Author = {
    id: 'a6f682de-5fd4-442e-a237-71b30281a2d6',
    name: 'Jane Austen'
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

  it('renders the form with Name field and action buttons', () => {
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not show the ID field when creating an author', () => {
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    expect(screen.queryByLabelText('ID')).not.toBeInTheDocument();
  });

  it('limits the name to 128 characters', () => {
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '128');
  });

  it('disables the Save button when the name is empty', () => {
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('redirects to authors page when clicking the Cancel button', async () => {
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/authors');
  });

  it('shows a loading spinner on the Save button while submitting', async () => {
    let resolveDeferred!: (value: [number, PostAuthorResponse]) => void;
    const deferredResponse = new Promise<[number, PostAuthorResponse]>((resolve) => {
      resolveDeferred = resolve;
    });
    mock.onPost('/v1/authors').reply(() => deferredResponse);
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    await userEvent.type(screen.getByRole('textbox'), 'Jane Austen');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();

    await userEvent.click(saveButton);

    expect(saveButton.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveDeferred([200, sampleResponse]);

    await waitFor(() => {
      expect(saveButton.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/authors');
    });
  });

  it('submits the form and redirects to authors page', async () => {
    mock.onPost('/v1/authors').reply(200, sampleResponse);
    const wrapper = buildWrapper();

    render(<AuthorForm />, { wrapper });

    await userEvent.type(screen.getByRole('textbox'), 'Jane Austen');

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: 'Jane Austen' });
      expect(screen.getByTestId('location')).toHaveTextContent('/authors');
    });
  });

  it('renders a disabled ID field and a prefilled Name in edit mode', () => {
    const wrapper = buildWrapper();

    render(<AuthorForm author={sampleAuthor} />, { wrapper });

    expect(screen.getByLabelText('ID')).toBeDisabled();
    expect(screen.getByDisplayValue(sampleAuthor.name)).toBeInTheDocument();
  });

  it('disables the Save button until the name is changed in edit mode', async () => {
    const wrapper = buildWrapper();

    render(<AuthorForm author={sampleAuthor} />, { wrapper });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    const nameField = screen.getByDisplayValue(sampleAuthor.name);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Jane Austen Updated');

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });

  it('submits via PATCH and redirects to authors page in edit mode', async () => {
    mock.onPatch(`/v1/authors/${sampleAuthor.id}`).reply(200, sampleAuthor);
    const wrapper = buildWrapper();

    render(<AuthorForm author={sampleAuthor} />, { wrapper });

    const nameField = screen.getByDisplayValue(sampleAuthor.name);
    await userEvent.clear(nameField);
    await userEvent.type(nameField, 'Jane Austen Updated');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mock.history.patch.length).toBe(1);
      expect(mock.history.patch[0].url).toContain(sampleAuthor.id);
      expect(JSON.parse(mock.history.patch[0].data)).toEqual({ name: 'Jane Austen Updated' });
      expect(screen.getByTestId('location')).toHaveTextContent('/authors');
    });
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

    it('disables the name field and hides the Save button for a non-admin user', () => {
      const wrapper = buildWrapper();

      render(<AuthorForm author={sampleAuthor} />, { wrapper });

      expect(screen.getByDisplayValue(sampleAuthor.name)).toBeDisabled();
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows the ID field in view mode', () => {
      const wrapper = buildWrapper();

      render(<AuthorForm author={sampleAuthor} />, { wrapper });

      expect(screen.getByLabelText('ID')).toBeInTheDocument();
      expect(screen.getByLabelText('ID')).toBeDisabled();
    });

    it('does not submit any request in view mode', async () => {
      const wrapper = buildWrapper();

      render(<AuthorForm author={sampleAuthor} />, { wrapper });

      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(mock.history.post).toHaveLength(0);
      expect(mock.history.patch).toHaveLength(0);
    });
  });
});
