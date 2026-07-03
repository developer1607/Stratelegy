import dns from 'dns';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import { config } from '../../config.js';
import { getPbxAccessToken } from './auth.js';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

const ipv4Agent = new https.Agent({
  family: 4,
  lookup(hostname, options, callback) {
    return dns.lookup(hostname, { ...options, family: 4 }, callback);
  },
});

function pbxBaseUrl() {
  const url = config.pbx.apiBaseUrl;
  return url.endsWith('/') ? url : `${url}/`;
}

function toNetworkError(err) {
  const error = new Error('PBX API network request failed');
  error.status = 502;
  error.cause = err;
  return error;
}

function normalizeError(status, data) {
  const message =
    data?.error_description ||
    data?.error ||
    data?.message ||
    (typeof data === 'string' && data.trim() ? data.slice(0, 240) : null) ||
    `PBX API request failed (${status})`;
  const error = new Error(message);
  error.status = status >= 500 ? 502 : status;
  error.expose = status < 500;
  return error;
}

function parseBody(text, parseAs) {
  if (parseAs === 'text') return text;
  if (parseAs === 'json') return text ? JSON.parse(text) : {};
  return text ? xmlParser.parse(text) : {};
}

function requestWithIpv4(url, { method, headers, body }) {
  const requestBody =
    body instanceof URLSearchParams ? body.toString() : body == null ? undefined : body;
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        headers,
        agent: ipv4Agent,
        timeout: 30_000,
      },
      (res) => {
        let text = '';
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: Number(res.statusCode) >= 200 && Number(res.statusCode) < 300,
            status: Number(res.statusCode) || 500,
            text,
          });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (requestBody) req.write(requestBody);
    req.end();
  });
}

export async function pbxRequest(
  method,
  path = '',
  { body, contentType = 'application/x-www-form-urlencoded', parseAs = 'xml', auth = true } = {}
) {
  const url = new URL(path, pbxBaseUrl());
  const headers = {
    Accept: parseAs === 'json' ? 'application/json' : 'application/xml, text/xml, */*',
  };
  if (contentType) headers['Content-Type'] = contentType;
  if (auth) {
    const token = await getPbxAccessToken();
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await requestWithIpv4(url, { method, headers, body });
  } catch (err) {
    throw toNetworkError(err);
  }

  const data = parseBody(response.text, parseAs);
  if (!response.ok) {
    throw normalizeError(response.status, data);
  }
  return data;
}

export function firstNode(xml, key) {
  if (!xml) return null;
  const value = xml?.xml?.[key] ?? xml?.[key] ?? null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function nodeList(xml, key) {
  const value = xml?.xml?.[key] ?? xml?.[key] ?? [];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}
