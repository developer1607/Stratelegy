export const EMPTY_ROUTE_FORM = {
  type: 'pbx',
  treatment: 'user',
  domain: '',
  subscriber: '',
  enable: 'yes',
  notes: 'Routed via Stratelegy Insight',
};

export const EMPTY_E911_FORM = {
  name: '',
  street_number: '',
  street_name: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'US',
  location: '',
};

export const EMPTY_ROUTE_BY_ANI_FORM = {
  domain: '',
  ani: '',
  dnis: '',
  destination: '',
  application: 'user',
};

/** @param {Record<string, unknown>|null|undefined} data API route or list row */
export function mapRouteToForm(data, fallbackDomain = '') {
  if (!data) {
    return { ...EMPTY_ROUTE_FORM, domain: fallbackDomain };
  }

  const route = data.route && typeof data.route === 'object' ? data.route : data;

  return {
    type: data.type || 'pbx',
    treatment: route.treatment || 'user',
    domain: route.domain || data.domain || fallbackDomain,
    subscriber: route.subscriber || data.subscriber || '',
    enable: route.enable || data.enable || 'yes',
    notes: route.notes || data.notes || 'Routed via Stratelegy Insight',
  };
}

/** @param {Record<string, unknown>|null|undefined} data E911 detail or list item */
export function mapE911ToForm(data) {
  if (!data) return { ...EMPTY_E911_FORM };

  const civic =
    data.location?.address?.civic_address ||
    data.address?.civic_address ||
    data.civic_address ||
    data;

  return {
    name: civic.name || '',
    street_number: civic.street_number || '',
    street_name: civic.street_name || '',
    city: civic.city || '',
    state: civic.state || '',
    zip_code: civic.zip_code || '',
    country: civic.country || data.location?.address?.country || 'US',
    location: civic.location || civic.suite || '',
  };
}

/** @param {Record<string, unknown>|null|undefined} data Route-by-ANI row */
export function mapRouteByAniToForm(data, fallbackDomain = '') {
  if (!data) {
    return { ...EMPTY_ROUTE_BY_ANI_FORM, domain: fallbackDomain };
  }

  return {
    domain: data.domain || fallbackDomain,
    ani: data.ani || '',
    dnis: data.dnis || '',
    destination: data.destination || '',
    application: data.application || 'user',
  };
}
