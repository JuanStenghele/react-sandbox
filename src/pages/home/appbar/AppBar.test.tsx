import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useAuth } from 'react-oidc-context'
import { buildAuthProps } from '../../../test/utils'
import HomeAppBar from './AppBar';

vi.mock('react-oidc-context');

describe('HomeAppBar', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays the app name and the menu button', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true })
    );
    render(<HomeAppBar />)

    const appName = screen.getByText('React Sandbox')
    const menuButton = screen.getByLabelText('menu')

    expect(appName).toBeVisible()
    expect(menuButton).toBeVisible()
  })
})
