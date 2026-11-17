import type { ContactTopic, Conversation } from './db';

/** Sudhi reads these in the chat inbox, so they stay in English whatever language the visitor used. */
const TOPIC_SUBJECTS: Record<ContactTopic, string> = {
  job: 'Job opportunity',
  freelance: 'Freelance project',
  other: 'Something else',
};

/** The chat's subject line. */
export function buildSubject(conversation: Pick<Conversation, 'topic' | 'name'>): string {
  return `${TOPIC_SUBJECTS[conversation.topic]}: ${conversation.name}`;
}

/** The first message in a new chat, in the same layout the old site used. */
export function buildFirstMessage(conversation: Conversation): string {
  const subject = TOPIC_SUBJECTS[conversation.topic];
  const email = conversation.email ? `Email: ${conversation.email}` : '';
  const lines =
    conversation.service === 'hire_me'
      ? [
          'Hire Me Request',
          `From: ${conversation.name}`,
          email,
          `Topic: ${subject}`,
          conversation.message ? `Context: ${conversation.message}` : '',
        ]
      : [
          'New Contact Request',
          `Name: ${conversation.name}`,
          email,
          `Subject: ${subject}`,
          'Message:',
          conversation.message,
        ];
  return lines.filter(Boolean).join('\n').trim();
}
