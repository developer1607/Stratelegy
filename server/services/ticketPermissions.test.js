import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTicketUpdateAllowed } from './ticketPermissions.js';

const assignOnly = {
  can_view_tickets: true,
  can_assign_tickets: true,
};

const existing = {
  title: 'Help',
  description: 'Details',
  status: 'open',
  priority: 'medium',
  category: 'report_a_problem',
  department: 'support',
  source: 'web',
  assigned_to: null,
  requester: 'User',
  requester_email: 'user@example.com',
};

test('assign-only user can update assigned_to without edit permission', () => {
  assert.doesNotThrow(() =>
    assertTicketUpdateAllowed(assignOnly, existing, {
      title: existing.title,
      description: existing.description,
      status: existing.status,
      priority: existing.priority,
      category: existing.category,
      department: existing.department,
      source: existing.source,
      requester: existing.requester,
      requester_email: existing.requester_email,
      assigned_to: 'agent@example.com',
    })
  );
});

test('assign-only user cannot change ticket title', () => {
  assert.throws(
    () =>
      assertTicketUpdateAllowed(assignOnly, existing, {
        title: 'Changed title',
      }),
    /edit tickets/
  );
});

test('assign-only user can unassign a ticket', () => {
  assert.doesNotThrow(() =>
    assertTicketUpdateAllowed(
      assignOnly,
      { ...existing, assigned_to: 'agent@example.com' },
      {
        assigned_to: null,
      }
    )
  );
});
