import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInPage from './SignIn';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps } from '../../test/utils';

vi.mock('react-oidc-context');

describe('SignInPage', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays the app title', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, signinRedirect: vi.fn() })
    );
    render(<SignInPage />);

    const appTitle = screen.getByText('React Sandbox');

    expect(appTitle).toBeVisible();
  });

  it('redirects to sign in page when clicking the sign in button', async () => {
    const signinRedirect = vi.fn();
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, signinRedirect })
    );
    render(<SignInPage />);

    const signInButton = screen.getByLabelText('sign-in-button');
    await userEvent.click(signInButton)

    expect(signinRedirect).toHaveBeenCalled();
  });
});
