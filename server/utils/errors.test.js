import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHttpError, isDatabaseError, looksLikeInternalLeak } from '../utils/errors.js';

test('isDatabaseError detects mysql errors', () => {
  assert.equal(isDatabaseError({ code: 'ER_BAD_FIELD_ERROR' }), true);
  assert.equal(isDatabaseError({ sqlState: '42S22' }), true);
  assert.equal(isDatabaseError({ message: 'normal error' }), false);
});

test('looksLikeInternalLeak flags SQL messages', () => {
  assert.equal(looksLikeInternalLeak("Unknown column 'foo' in 'field list'"), true);
  assert.equal(looksLikeInternalLeak('Invalid email or password'), false);
});

test('formatHttpError hides database errors in production-like 500s', () => {
  const err = new Error('You have an error in your SQL syntax');
  err.code = 'ER_PARSE_ERROR';
  const result = formatHttpError(err);
  assert.equal(result.status, 500);
  assert.equal(result.message, 'Internal server error');
});

test('formatHttpError returns safe 4xx messages', () => {
  const err = new Error('Email and password are required');
  err.status = 400;
  const result = formatHttpError(err);
  assert.equal(result.status, 400);
  assert.equal(result.message, 'Email and password are required');
});

test('formatHttpError respects expose flag', () => {
  const err = new Error('Invite token expired');
  err.status = 400;
  err.expose = true;
  const result = formatHttpError(err);
  assert.equal(result.message, 'Invite token expired');
});
