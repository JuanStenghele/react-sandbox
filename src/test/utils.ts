import { vi } from 'vitest';
import type { AuthContextProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';

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

export const buildAuthUser = (overrides: Partial<User> = {}): User => ({
  access_token: 'fake-token',
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
  ...overrides,
}) as User;
