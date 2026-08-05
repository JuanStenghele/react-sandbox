import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { useAuth } from 'react-oidc-context'
import { buildAuthProps } from '../../test/utils'
import HomePage from './Home'

vi.mock('react-oidc-context');

describe('Home', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays the drawer by default', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Books')).toBeVisible();
  });

  it('toggles the drawer when the menu button is clicked', async () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText('menu');
    const drawer = document.querySelector('.MuiDrawer-root');

    await userEvent.click(menuButton);
    expect(drawer).toHaveStyle({ width: '0px' });

    await userEvent.click(menuButton);
    expect(drawer).toHaveStyle({ width: '200px' });
  });
});
