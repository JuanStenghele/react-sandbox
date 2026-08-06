import { vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps, buildAuthUser } from '../../test/utils';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import AdminGate from './AdminGate';

vi.mock('react-oidc-context');

describe('AdminGate', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays the outlet when user is admin', () => {
    const adminUser = buildAuthUser({ scope: 'openid admin' });
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, isLoading: false, user: adminUser })
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AdminGate />}>
            <Route index element={<>PROTECTED CONTENT</>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('PROTECTED CONTENT')).toBeInTheDocument();
  });

  it('redirects to unauthorized page if user is not admin', () => {
    const regularUser = buildAuthUser({ scope: 'openid' });
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, isLoading: false, user: regularUser })
    );
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AdminGate />}>
            <Route index element={<>PROTECTED CONTENT</>} />
          </Route>
          <Route path='unauthorized' element={<>UNAUTHORIZED PAGE</>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('PROTECTED CONTENT')).not.toBeInTheDocument();
    expect(screen.getByText('UNAUTHORIZED PAGE')).toBeInTheDocument();
  });
});
