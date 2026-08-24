import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import type { ErrorContext } from 'react-oidc-context';
import { buildAuthProps } from '../../test/utils';
import AuthGate from './AuthGate';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { useSnackbar } from 'notistack';

vi.mock('react-oidc-context');
vi.mock('notistack');

describe('AuthGate', () => {
  const mockedUseAuth = vi.mocked(useAuth);
  const mockedUseSnackbar = vi.mocked(useSnackbar);
  const enqueueSnackbar = vi.fn();

  beforeEach(() => {
    mockedUseSnackbar.mockReturnValue({
      enqueueSnackbar,
      closeSnackbar: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows an error notification when auth has an error', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({
        isAuthenticated: false,
        isLoading: false,
        error: new Error('test error') as ErrorContext
      })
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthGate />}>
            <Route index element={<>PROTECTED CONTENT</>} />
          </Route>
          <Route path='login' element={<>LOGIN PAGE</>} />
        </Routes>
      </MemoryRouter>
    );

    expect(enqueueSnackbar).toHaveBeenCalledWith('Authentication error: test error', {
      variant: 'error'
    });
  });

  it('displays the loading screen when auth is loading', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, isLoading: true })
    );
    render(<AuthGate />);

    const loadingSpinner = screen.getByLabelText('loading-spinner');

    expect(loadingSpinner).toBeVisible();
  });

  it('displays the outlet when user is authenticated', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, isLoading: false })
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthGate />}>
            <Route index element={<>PROTECTED CONTENT</>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('PROTECTED CONTENT')).toBeInTheDocument();
  });

  it('redirects to login if the user is not authenticated', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, isLoading: false })
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthGate />}>
            <Route index element={<>PROTECTED CONTENT</>} />
          </Route>
          <Route path='login' element={<>LOGIN PAGE</>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });
});
