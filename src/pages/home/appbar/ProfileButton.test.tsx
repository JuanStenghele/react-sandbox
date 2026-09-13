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

    expect(screen.getByLabelText('profile')).toBeInTheDocument();
  });

  it('opens the menu when clicking the profile button', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(<ProfileButton />);

    fireEvent.click(screen.getByLabelText('profile'));

    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('opens the language submenu when hovering the Language item', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(<ProfileButton />);

    fireEvent.click(screen.getByLabelText('profile'));
    fireEvent.mouseEnter(screen.getByText('Language'));

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('calls removeUser when clicking Sign Out', () => {
    const removeUser = vi.fn();
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, removeUser })
    );
    render(<ProfileButton />);

    fireEvent.click(screen.getByLabelText('profile'));
    fireEvent.click(screen.getByText('Sign Out'));

    expect(removeUser).toHaveBeenCalled();
  });
});
