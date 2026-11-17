import type { ContactTopic } from '../chat-queue/db';

export type ContactValues = { name: string; email: string; topic: ContactTopic; message: string };
export type ContactField = 'name' | 'email' | 'message';
/** Keys under contact.errors in the translation files. */
type ContactErrorKey =
  | 'nameRequired'
  | 'nameTooShort'
  | 'emailRequired'
  | 'emailInvalid'
  | 'messageRequired'
  | 'messageTooShort'
  | 'messageTooLong';
export type ContactErrors = Partial<Record<ContactField, ContactErrorKey>>;

/** Form order, so focus goes to the first problem a person would meet. */
export const FIELD_ORDER: ContactField[] = ['name', 'email', 'message'];
const MESSAGE_MIN = 10;
/** Same limit as the Netlify Function, so a name the form accepts is never refused later. */
export const NAME_MAX = 80;
export const MESSAGE_MAX = 4000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) errors.name = 'nameRequired';
  else if (name.length < 2) errors.name = 'nameTooShort';

  if (!email) errors.email = 'emailRequired';
  else if (!EMAIL.test(email) || email.length > 254) errors.email = 'emailInvalid';

  if (!message) errors.message = 'messageRequired';
  else if (message.length < MESSAGE_MIN) errors.message = 'messageTooShort';
  else if (message.length > MESSAGE_MAX) errors.message = 'messageTooLong';

  return errors;
}

export function isContactTopic(value: string | null): value is ContactTopic {
  return value === 'job' || value === 'freelance' || value === 'other';
}
