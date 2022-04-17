const _strtobool = (str: string | undefined, returnOnFail: any = null) =>
  str === "true" ? true : str === "false" ? false : returnOnFail;

// ..._OKD envvars used if run on OKD (can't edit .env on OKD)
export const DEVELOPER_MODE =
  _strtobool(process.env.REACT_APP_DEVELOPER_MODE_OKD) ||
  _strtobool(process.env.REACT_APP_DEVELOPER_MODE) ||
  true;

export const MAPBOX_TOKEN =
  process.env.REACT_APP_MAPBOX_TOKEN_OKD ||
  process.env.REACT_APP_MAPBOX_TOKEN ||
  "";

/*export const SITE_URL =
  process.env.REACT_APP_SITE_URL_OKD ||
  process.env.REACT_APP_SITE_URL ||
  "http://localhost:3000/";*/

export const API_BACKEND_URL =
  process.env.REACT_APP_API_BACKEND_URL_OKD ||
  process.env.REACT_APP_API_BACKEND_URL ||
  "https://imagine-2022-backend-git-imagine2022-backend.apps.okd4.csh.rit.edu";

export const API_BEACON_LOCATIONS_URL =
  process.env.REACT_APP_API_BEACON_LOCATIONS_URL_OKD ||
  process.env.REACT_APP_API_BEACON_LOCATIONS_URL ||
  "/beacons/locations";

// SSO
const _CLIENT_ID =
  process.env.REACT_APP_SSO_CLIENT_ID_OKD ||
  process.env.REACT_APP_SSO_CLIENT_ID ||
  "react-boilerplate";
const _CLIENT_SECRET =
  process.env.REACT_APP_SSO_CLIENT_SECRET_OKD ||
  process.env.REACT_APP_SSO_CLIENT_SECRET ||
  "";
const _POST_LOGOUT_REDIRECT_URI =
  process.env.REACT_APP_SITE_URL_OKD ||
  process.env.REACT_APP_SITE_URL ||
  "http://localhost:3000/";
const _AUTHORITY =
  process.env.REACT_APP_SSO_AUTHORITY_OKD ||
  process.env.REACT_APP_SSO_AUTHORITY ||
  "https://sso.csh.rit.edu/auth/realms/csh";

export const oidcConfiguration = {
  client_id: _CLIENT_ID,
  client_secret: _CLIENT_SECRET,
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }/authentication/callback`,
  response_type: "code",
  post_logout_redirect_uri: _POST_LOGOUT_REDIRECT_URI,
  scope: "openid profile email offline_access",
  authority: _AUTHORITY,
  silent_redirect_uri: `${window.location.protocol}//${
    window.location.hostname
  }${
    window.location.port ? `:${window.location.port}` : ""
  }/authentication/silent_callback`,
  automaticSilentRenew: true,
  loadUserInfo: true,
};

console.log(oidcConfiguration.redirect_uri);
console.log(oidcConfiguration.silent_redirect_uri);
console.log(oidcConfiguration.post_logout_redirect_uri);
