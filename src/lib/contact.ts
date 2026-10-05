// Shared contact-form rules, used by the form (instant feedback) and the API (enforcement).

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 10, max: 3000 },
} as const;

export type ContactInput = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (name.length < LIMITS.name.min) errors.name = "Please enter your name.";
  else if (name.length > LIMITS.name.max) errors.name = `Please keep your name under ${LIMITS.name.max} characters.`;

  if (!EMAIL.test(email) || email.length > LIMITS.email.max) errors.email = "Please enter a valid email address.";

  if (message.length < LIMITS.message.min) errors.message = "Please write a little more (at least 10 characters).";
  else if (message.length > LIMITS.message.max) errors.message = `Please keep it under ${LIMITS.message.max} characters.`;

  return errors;
}
