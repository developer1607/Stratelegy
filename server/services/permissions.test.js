import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermissionKey, PERMISSION_KEYS } from '../../shared/permissionRegistry.js';

test('PERMISSION_KEYS is a non-empty array', () => {
  assert.ok(Array.isArray(PERMISSION_KEYS));
  assert.ok(PERMISSION_KEYS.length > 10);
});

test('hasPermissionKey grants admin all permissions', () => {
  assert.equal(hasPermissionKey({ isAdmin: true }, 'can_view_tickets_page'), true);
  assert.equal(hasPermissionKey({ isAdmin: true }, 'can_manage_pbx_routing'), true);
});

test('hasPermissionKey respects explicit permission flags', () => {
  const userPerms = { can_view_tickets_page: true, can_create_tickets: false };
  assert.equal(hasPermissionKey(userPerms, 'can_view_tickets_page'), true);
  assert.equal(hasPermissionKey(userPerms, 'can_create_tickets'), false);
});

test('hasPermissionKey denies unknown keys', () => {
  assert.equal(hasPermissionKey({ can_view_tickets_page: true }, 'not_a_real_permission'), false);
});
