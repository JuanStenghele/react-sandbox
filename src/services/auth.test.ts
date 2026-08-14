import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from 'react-oidc-context';
import { buildAuthProps, buildAuthUser } from '../test/utils';
import { useHasPermission } from './auth';
import { adminScope } from '../constants';

vi.mock('react-oidc-context');

describe('useHasPermission', () => {
  const mockedUseAuth = vi.mocked(useAuth);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the user has the scope', () => {
    const adminUser = buildAuthUser({ scopes: ['openid', adminScope] });
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, user: adminUser })
    );

    const { result } = renderHook(() => useHasPermission(adminScope));

    expect(result.current).toBe(true);
  });

  it('returns false when the user does not have the scope', () => {
    const regularUser = buildAuthUser({ scopes: ['openid'] });
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: true, user: regularUser })
    );

    const { result } = renderHook(() => useHasPermission(adminScope));

    expect(result.current).toBe(false);
  });

  it('returns false when there is no user', () => {
    mockedUseAuth.mockReturnValue(
      buildAuthProps({ isAuthenticated: false, user: undefined })
    );

    const { result } = renderHook(() => useHasPermission(adminScope));

    expect(result.current).toBe(false);
  });
});
