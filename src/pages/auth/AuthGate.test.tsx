import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps } from '../../test/utils';
import AuthGate from './AuthGate';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

vi.mock('react-oidc-context');

describe('AuthGate', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
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

  it('displays the sign in page if the user is not authenticated', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, isLoading: false })
    );
    render(<AuthGate />);

    const signInButton = screen.getByLabelText('sign-in-button');

    expect(signInButton).toBeInTheDocument();
  });
});
