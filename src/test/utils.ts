import { createElement } from 'react';
import { useLocation } from 'react-router';
import { vi } from 'vitest';
import type { AuthContextProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';

export const LocationDisplay = () => {
  const location = useLocation();
  return createElement('div', { 'data-testid': 'location' }, location.pathname);
};

export const buildAuthProps = (overrides: Partial<AuthContextProps> = {}): AuthContextProps => ({
  isLoading: false,
  isAuthenticated: false,
  user: undefined,
  activeNavigator: undefined,
  error: undefined,
  settings: {} as AuthContextProps['settings'],
  events: {} as AuthContextProps['events'],
  signinRedirect: vi.fn(),
  signinSilent: vi.fn(),
  signinPopup: vi.fn(),
  signinResourceOwnerCredentials: vi.fn(),
  signoutRedirect: vi.fn(),
  signoutPopup: vi.fn(),
  signoutSilent: vi.fn(),
  removeUser: vi.fn(),
  clearStaleState: vi.fn(),
  querySessionStatus: vi.fn(),
  revokeTokens: vi.fn(),
  startSilentRenew: vi.fn(),
  stopSilentRenew: vi.fn(),
  ...overrides
});

const base64UrlEncode = (input: string) =>
  btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const buildAccessToken = (permissions: string[] = []) => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ permissions }));
  return `${header}.${payload}.signature`;
};

type BuildAuthUserOptions = Partial<User> & { permissions?: string[] };

export const buildAuthUser = (overrides: BuildAuthUserOptions = {}): User => {
  const { permissions = [], ...rest } = overrides;

  return {
    access_token: buildAccessToken(permissions),
    id_token: 'fake-id-token',
    refresh_token: 'fake-refresh-token',
    token_type: 'Bearer',
    scope: 'openid',
    profile: { sub: 'user-123' },
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expired: false,
    scopes: ['openid'],
    session_state: null,
    state: undefined,
    toStorageString: () => '',
    ...rest,
  } as User;
};
