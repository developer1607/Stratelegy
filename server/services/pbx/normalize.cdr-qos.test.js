import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCdrRows } from './normalize.js';

test('normalizeCdrRows reads NQS a_mos_min_mult10 from qos_orig/qos_term', () => {
  const xml = {
    xml: {
      cdr: {
        cdr_id: 'test-cdr-1',
        domain: 'Alexandria.20989.service',
        orig_from_name: 'ANN JONES',
        orig_from_uri: 'sip:13153231922@Alexandria.20989.service',
        orig_to_user: '13154829637',
        time_start: '1783712245',
        time_answer: '1783712250',
        time_release: '1783712461',
        duration: '216',
        time_talking: '216',
        qos_orig: {
          a_mos_min_mult10: '45',
          b_mos_min_mult10: '45',
          nqs_server: 'rtp-sight.skyswitch.com',
        },
        qos_term: {
          a_mos_min_mult10: '40',
          b_mos_min_mult10: '45',
        },
      },
    },
  };

  const [row] = normalizeCdrRows(xml);
  assert.equal(row.qos_orig, 4.5);
  assert.equal(row.qos_term, 4.0);
  assert.equal(row.qos, 4.5);
});

test('normalizeCdrRows keeps MOS 0 (failed/no media) instead of blanking it', () => {
  const xml = {
    xml: {
      cdr: {
        cdr_id: 'test-cdr-0',
        duration: '0',
        qos_orig: { a_mos_min_mult10: '0', b_mos_min_mult10: '0' },
        qos_term: { a_mos_min_mult10: '0', b_mos_min_mult10: '0' },
      },
    },
  };

  const [row] = normalizeCdrRows(xml);
  assert.equal(row.qos_orig, 0);
  assert.equal(row.qos_term, 0);
  assert.equal(row.qos, 0);
});
