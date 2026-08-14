import { UserManager } from 'oidc-client-ts';
import { WebStorageStateStore } from 'oidc-client-ts';
import { adminScope } from '../constants';
import { useAuth } from 'react-oidc-context';

const OIDCScopes = 'openid profile email offline_access';
const requestedAuthScopes = `${OIDCScopes} ${adminScope}`;

export const authOIDCConfig = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin,
  scope: requestedAuthScopes,
  // TODO: Move this in the future to httpOnly cookie
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

export const userManager = new UserManager(authOIDCConfig);

export const useHasPermission = (scope: string) => {
  const auth = useAuth();
  const scopes = auth.user?.scopes ?? [];
  return scopes.includes(scope);
};
