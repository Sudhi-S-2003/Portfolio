/**
 * Also send every message to Netlify Forms, which keeps it in the site dashboard and emails Sudhi. This is the
 * safety net for when the chat backend is down. Set to false to rely on the chat alone.
 */
export const CONTACT_EMAIL_BACKUP = true;

/** Subject for the visitor's own email app when they choose "Email me instead". Sudhi reads it, so English. */
const EMAIL_SUBJECT = 'Message from your portfolio';

/** Some mail apps refuse very long mailto links, so the draft carries at most this much of the message. */
const MAILTO_BODY_MAX = 1500;

export function mailtoLink(email: string, message = ''): string {
  const body = message.length > MAILTO_BODY_MAX ? `${message.slice(0, MAILTO_BODY_MAX)}…` : message;
  const params = new URLSearchParams({ subject: EMAIL_SUBJECT, body });
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
}
