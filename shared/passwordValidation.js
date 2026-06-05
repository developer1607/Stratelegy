/** Strong password policy — shared by client and server. */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_REQUIREMENT_LABELS = [
  `At least ${PASSWORD_MIN_LENGTH} characters`,
  "One uppercase letter (A–Z)",
  "One lowercase letter (a–z)",
  "One number (0–9)",
  "One special character (!@#$%^&* etc.)",
];

/**
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePassword(password) {
  const errors = [];

  if (password == null || password === "") {
    return { valid: false, errors: ["Password is required"] };
  }
  if (typeof password !== "string") {
    return { valid: false, errors: ["Password must be a string"] };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter (a–z)");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter (A–Z)");
  if (!/[0-9]/.test(password)) errors.push("One number (0–9)");
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push("One special character (!@#$%^&* etc.)");

  return { valid: errors.length === 0, errors };
}

export function formatPasswordErrors(errors) {
  if (!errors?.length) return "Password does not meet requirements";
  if (errors.length === 1) return `Password must include: ${errors[0]}`;
  return `Password must include: ${errors.join("; ")}`;
}

/** Client UI helper — live requirement checklist. */
export function getPasswordChecks(password = "") {
  const value = String(password);
  return [
    {
      key: "length",
      label: PASSWORD_REQUIREMENT_LABELS[0],
      met:
        value.length >= PASSWORD_MIN_LENGTH &&
        value.length <= PASSWORD_MAX_LENGTH,
    },
    {
      key: "upper",
      label: PASSWORD_REQUIREMENT_LABELS[1],
      met: /[A-Z]/.test(value),
    },
    {
      key: "lower",
      label: PASSWORD_REQUIREMENT_LABELS[2],
      met: /[a-z]/.test(value),
    },
    {
      key: "digit",
      label: PASSWORD_REQUIREMENT_LABELS[3],
      met: /[0-9]/.test(value),
    },
    {
      key: "special",
      label: PASSWORD_REQUIREMENT_LABELS[4],
      met: /[^A-Za-z0-9]/.test(value),
    },
  ];
}

export function isPasswordValid(password) {
  return validatePassword(password).valid;
}

/** @throws {Error & { status: number }} */
export function assertPasswordValid(password) {
  const { valid, errors } = validatePassword(password);
  if (!valid) {
    const err = new Error(formatPasswordErrors(errors));
    err.status = 400;
    throw err;
  }
}
