const _strtobool = (str: string | undefined, returnOnFail: any = null) =>
  str === "true" ? true : str === "false" ? false : returnOnFail;
export const developerMode =
  _strtobool(process.env["REACT_APP_DEVELOPER_MODE_OKD"]) ||
  _strtobool(process.env["REACT_APP_DEVELOPER_MODE"]) ||
  true;

// SSO
export const oidcConfiguration = {
  client_id:
    process.env.REACT_APP_SSO_CLIENT_ID_OKD ||
    process.env.REACT_APP_SSO_CLIENT_ID,
  client_secret:
    process.env.REACT_APP_SSO_CLIENT_SECRET_OKD ||
    process.env.REACT_APP_SSO_CLIENT_SECRET,
  redirect_uri: `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }/authentication/callback`,
  response_type: "code",
  post_logout_redirect_uri:
    process.env.REACT_APP_SITE_URL_OKD ||
    process.env.REACT_APP_SITE_URL ||
    "http://localhost:3000",
  scope: "openid profile email offline_access",
  authority:
    process.env.REACT_APP_SSO_AUTHORITY_OKD ||
    process.env.REACT_APP_SSO_AUTHORITY,
  silent_redirect_uri: `${window.location.protocol}//${
    window.location.hostname
  }${
    window.location.port ? `:${window.location.port}` : ""
  }/authentication/silent_callback`,
  automaticSilentRenew: true,
  loadUserInfo: true,
};
