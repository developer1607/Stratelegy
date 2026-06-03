/** Production CSP — Inter is self-hosted via @fontsource/inter; no external font domains. */
export const PRODUCTION_CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  styleSrcElem: ["'self'", "'unsafe-inline'"],
  fontSrc: ["'self'", 'data:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  connectSrc: ["'self'", 'ws:', 'wss:'],
};

/** Dev CSP — Vite HMR / React refresh require eval; never use in production. */
export const DEVELOPMENT_CSP_DIRECTIVES = {
  ...PRODUCTION_CSP_DIRECTIVES,
  scriptSrc: ["'self'", "'unsafe-eval'"],
  connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*', 'http://127.0.0.1:*'],
};
