import { vi } from 'vitest';
import type { AuthContextProps } from "react-oidc-context";

export const buildAuthProps = (overrides: Partial<AuthContextProps> = {}): AuthContextProps => ({
  isLoading: false,
  isAuthenticated: false,
  user: undefined,
  activeNavigator: undefined,
  error: undefined,
  settings: {} as AuthContextProps["settings"],
  events: {} as AuthContextProps["events"],
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
