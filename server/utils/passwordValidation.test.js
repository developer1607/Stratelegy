import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePassword,
  assertPasswordValid,
  formatPasswordErrors,
} from "../../shared/passwordValidation.js";

test("validatePassword rejects weak passwords", () => {
  const weak = validatePassword("short");
  assert.equal(weak.valid, false);
  assert.ok(weak.errors.length > 0);
});

test("validatePassword accepts strong passwords", () => {
  const strong = validatePassword("Admin@123!");
  assert.equal(strong.valid, true);
  assert.deepEqual(strong.errors, []);
});

test("assertPasswordValid throws with status 400", () => {
  assert.throws(
    () => assertPasswordValid("weak"),
    (err) => err.status === 400 && /Password must include/.test(err.message),
  );
});

test("formatPasswordErrors joins multiple issues", () => {
  const msg = formatPasswordErrors([
    "One number (0–9)",
    "One special character (!@#$%^&* etc.)",
  ]);
  assert.match(msg, /One number/);
  assert.match(msg, /special character/);
});
