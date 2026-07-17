/** Combine Telco civic_address fields into one Location label for E911 screens. */

function cleanCivicPart(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "n/a") return "";
  return text;
}

/** Normalize civic fields from list/detail/v2 E911 payloads. */
export function extractCivicAddress(record) {
  if (!record || typeof record !== "object") return {};
  return (
    record?.location?.address?.civic_address ||
    record?.address?.civic_address ||
    record?.civic_address ||
    record
  );
}

export function civicHasStreet(civic) {
  const address = extractCivicAddress(civic);
  return Boolean(
    cleanCivicPart(address.street_number) ||
    cleanCivicPart(address.street_name),
  );
}

/**
 * Full civic address as a single string, e.g.
 * "46372 COUNTY ROUTE 1, Municipal Building ALEXANDRIA NY 13607 United States"
 */
export function formatCivicAddressLabel(civic) {
  const address = extractCivicAddress(civic);
  if (!address || typeof address !== "object") return null;

  const streetNumber = cleanCivicPart(address.street_number);
  const streetName = cleanCivicPart(address.street_name);
  const suite =
    cleanCivicPart(address.location) ||
    cleanCivicPart(address.suite) ||
    cleanCivicPart(address.name);
  const city = cleanCivicPart(address.city);
  const state = cleanCivicPart(address.state);
  const zip = cleanCivicPart(address.zip_code);
  let country = cleanCivicPart(address.country);
  if (/^us$|^usa$/i.test(country)) country = "United States";

  const streetLine = [streetNumber, streetName].filter(Boolean).join(" ");
  if (!streetLine && !suite && !city && !state && !zip && !country) return null;

  let label = streetLine;
  if (suite) {
    label = label ? `${label}, ${suite}` : suite;
  }

  const locality = [city, state, zip].filter(Boolean).join(" ");
  if (locality) {
    label = label ? `${label} ${locality}` : locality;
  }

  if (country) {
    label = label ? `${label} ${country}` : country;
  }

  return label;
}
