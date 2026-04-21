import Keycloak from 'keycloak-js';

const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const keycloakUrl = isLocal
  ? 'https://jarhead593.duckdns.org/auth'
  : `${window.location.origin}/auth`;

const redirectUri = isLocal
  ? 'http://localhost:4200/'
  : `${window.location.origin}/saludo/`;

const dashboardUri = isLocal
  ? 'https://jarhead593.duckdns.org/dashboard'
  : `${window.location.origin}/dashboard`;

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: 'FFAA',
  clientId: 'frontend-saludo'
});

export async function initAuth(): Promise<void> {
  const authenticated = await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    redirectUri
  });

  if (!authenticated) {
    await keycloak.login({ redirectUri });
    return;
  }

  if (!hasSaludoAccess()) {
    window.location.replace(dashboardUri);
    return;
  }

  setInterval(() => {
    keycloak.updateToken(30).catch(() => {
      keycloak.login({ redirectUri });
    });
  }, 10000);
}

export function getAccessToken(): string {
  return keycloak.token ?? '';
}

export async function logout(): Promise<void> {
  await keycloak.logout({ redirectUri });
}

function hasSaludoAccess(): boolean {
  const parsed = keycloak.tokenParsed as Record<string, any> | undefined;
  if (!parsed) {
    return false;
  }

  const realmAccess = parsed['realm_access'] as { roles?: string[] } | undefined;
  const realmRoles: string[] = Array.isArray(realmAccess?.roles)
    ? realmAccess.roles
    : [];

  const resourceAccess = (parsed['resource_access'] as Record<string, any>) ?? {};
  const clientRoles = Object.values(resourceAccess)
    .flatMap((client: any) => Array.isArray(client?.roles) ? client.roles : [])
    .map((role: any) => String(role));

  const allRoles = new Set([...realmRoles, ...clientRoles]);
  return allRoles.has('BACK_SALUDO')
    || allRoles.has('rol.saludo.user')
    || allRoles.has('rol.saludo.admin')
    || allRoles.has('ADMIN');
}
