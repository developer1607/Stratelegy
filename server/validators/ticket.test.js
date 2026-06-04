import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTicketCreate,
  validateTicketUpdate,
  validateCommentCreate,
} from '../validators/ticket.js';

test('validateTicketCreate requires title and category', () => {
  assert.throws(
    () => validateTicketCreate({ title: '', category: 'sales_inquiry' }),
    /title is required/
  );
  assert.throws(
    () => validateTicketCreate({ title: 'Help', category: 'invalid' }),
    /valid category is required/
  );
});

test('validateTicketCreate returns normalized defaults', () => {
  const ticket = validateTicketCreate({
    title: '  Outage report  ',
    category: 'report_an_outage',
    description: 'Site is down',
  });
  assert.equal(ticket.title, 'Outage report');
  assert.equal(ticket.status, 'open');
  assert.equal(ticket.priority, 'medium');
  assert.equal(ticket.source, 'web');
});

test('validateTicketUpdate rejects invalid status', () => {
  assert.throws(() => validateTicketUpdate({ status: 'not_a_status' }), /invalid status/);
});

test('validateCommentCreate requires ticket_id and message', () => {
  assert.throws(() => validateCommentCreate({ ticket_id: '1' }), /message is required/);
  assert.throws(() => validateCommentCreate({ message: 'Hi' }), /ticket_id is required/);
});

test('validateCommentCreate normalizes payload', () => {
  const comment = validateCommentCreate({
    ticket_id: 'abc',
    message: '  Follow up  ',
    is_internal: 1,
  });
  assert.equal(comment.message, 'Follow up');
  assert.equal(comment.is_internal, true);
});
