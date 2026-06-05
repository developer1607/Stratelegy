/** Production CSP — Inter is self-hosted via @fontsource/inter; no external font domains. */
export const PRODUCTION_CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  styleSrcElem: ["'self'", "'unsafe-inline'"],
  fontSrc: ["'self'", "data:"],
  imgSrc: ["'self'", "data:", "blob:", "https:"],
  connectSrc: ["'self'", "ws:", "wss:"],
};

const DEV_SCRIPT_SOURCES = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];

/** Dev CSP — Vite injects inline module scripts and may evaluate source maps. */
export const DEVELOPMENT_CSP_DIRECTIVES = {
  ...PRODUCTION_CSP_DIRECTIVES,
  scriptSrc: DEV_SCRIPT_SOURCES,
  scriptSrcElem: DEV_SCRIPT_SOURCES,
  connectSrc: [
    "'self'",
    "ws:",
    "wss:",
    "http://localhost:*",
    "http://127.0.0.1:*",
  ],
  workerSrc: ["'self'", "blob:"],
  // Helmet default; breaks http://localhost when enabled over plain HTTP.
  upgradeInsecureRequests: null,
};
