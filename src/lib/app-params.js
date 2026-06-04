const isNode = typeof window === 'undefined';

/** @type {Storage} */
const storage = isNode
  ? {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    }
  : window.localStorage;

const toSnakeCase = (str) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

const LEGACY_PARAM_PREFIX = 'base44_';

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) return defaultValue;
  const storageKey = `app_${toSnakeCase(paramName)}`;
  const legacyStorageKey = `${LEGACY_PARAM_PREFIX}${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (searchParam) {
    storage.setItem(storageKey, searchParam);
    storage.removeItem(legacyStorageKey);
    return searchParam;
  }
  if (defaultValue) {
    storage.setItem(storageKey, defaultValue);
    storage.removeItem(legacyStorageKey);
    return defaultValue;
  }

  const storedValue = storage.getItem(storageKey);
  if (storedValue) return storedValue;

  const legacyValue = storage.getItem(legacyStorageKey);
  if (legacyValue) {
    storage.setItem(storageKey, legacyValue);
    storage.removeItem(legacyStorageKey);
    return legacyValue;
  }

  return null;
};

const getAppParams = () => {
  if (getAppParamValue('clear_access_token') === 'true') {
    ['access_token', 'token', 'base44_access_token', 'app_access_token'].forEach((key) =>
      storage.removeItem(key)
    );
  }
  return {
    appId:
      getAppParamValue('app_id', { defaultValue: import.meta.env.VITE_APP_ID }) ||
      'stratelegy-insight',
    token: getAppParamValue('access_token', { removeFromUrl: true }),
    fromUrl: getAppParamValue('from_url', {
      defaultValue: isNode
        ? '/'
        : `${window.location.pathname}${window.location.search}${window.location.hash}`,
    }),
    functionsVersion: getAppParamValue('functions_version'),
    appBaseUrl: getAppParamValue('app_base_url', {
      defaultValue: import.meta.env.VITE_APP_BASE_URL,
    }),
  };
};

export const appParams = { ...getAppParams() };
