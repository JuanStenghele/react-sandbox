import { UserManager } from 'oidc-client-ts';
import { WebStorageStateStore } from 'oidc-client-ts';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from 'react-oidc-context';

const OIDCScopes = 'openid profile email';

export const authOIDCConfig = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  scope: OIDCScopes,
  // TODO: Move this in the future to httpOnly cookie
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

export const userManager = new UserManager(authOIDCConfig);

interface AccessTokenPayload {
  permissions?: string[];
}

export const useHasPermission = (permission: string) => {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;
  if (!accessToken) {
    return false;
  }
  try {
    const payload = jwtDecode<AccessTokenPayload>(accessToken);
    const permissions = payload.permissions ?? [];
    return permissions.includes(permission);
  } catch {
    return false;
  }
};
