import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps } from '../../../test/utils';
import ProfileButton from './ProfileButton';

vi.mock('react-oidc-context');

const mockedUseAuth = vi.mocked(useAuth);

describe('ProfileButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile icon button', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(<ProfileButton />);

    expect(screen.getByLabelText('options')).toBeInTheDocument();
  });

  it('opens the menu when clicking the profile button', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(<ProfileButton />);

    fireEvent.click(screen.getByLabelText('options'));

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls removeUser when clicking Sign Out', () => {
    const removeUser = vi.fn();
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, removeUser })
    );
    render(<ProfileButton />);

    fireEvent.click(screen.getByLabelText('options'));
    fireEvent.click(screen.getByText('Sign Out'));

    expect(removeUser).toHaveBeenCalled();
  });
});
