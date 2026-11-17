import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { TextArea } from '../../components/ui/TextArea';
import { TextField } from '../../components/ui/TextField';
import { SITE } from '../../data/site';
import { postEmailCopy } from '../chat-queue/api';
import type { ContactTopic } from '../chat-queue/db';
import { CONTACT_EMAIL_BACKUP, mailtoLink } from './emailCopy';
import { FIELD_ORDER, MESSAGE_MAX, NAME_MAX, validateContact, type ContactErrors, type ContactValues } from './validation';

const TOPICS: ContactTopic[] = ['job', 'freelance', 'other'];

type Outcome = { kind: 'emailed'; email: string } | { kind: 'blocked'; message: string } | { kind: 'tooFast' } | null;

type ContactFormProps = {
  initialTopic: ContactTopic;
  onQueued: (conversationId: string) => void;
  /** Submissions faster than this are treated as bots. */
  minFillMs?: number;
};

export function ContactForm({ initialTopic, onQueued, minFillMs = 2_000 }: ContactFormProps) {
  const { t } = useTranslation(['contact', 'common']);
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', topic: initialTopic, message: '' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const fieldRefs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };
  const honeypot = useRef<HTMLInputElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);

  // Take keyboard and screen-reader users to any message the form shows after a submit.
  useEffect(() => {
    if (outcome) outcomeRef.current?.focus({ preventScroll: true });
  }, [outcome]);

  /** One handler for every field, keyed by the control's name attribute. Fixing a field clears its error. */
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const field = event.target.name as keyof ContactValues;
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (field in current ? { ...current, [field]: undefined } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOutcome(null);
    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }
    if (honeypot.current?.value) return; // a bot filled the hidden field: drop it quietly
    if (Date.now() - startedAt.current < minFillMs) {
      setOutcome({ kind: 'tooFast' });
      return;
    }

    setSubmitting(true);
    const clean: ContactValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      topic: values.topic,
      message: values.message.trim(),
    };
    try {
      // Loaded on submit, so visitors who never send a message never download the database code.
      const [{ getDb }, { enqueueConversation }] = await Promise.all([
        import('../chat-queue/db'),
        import('../chat-queue/queue'),
      ]);
      // The queue sends both the email copy (first) and the chat, with retries.
      const conversation = await enqueueConversation(
        getDb(),
        { ...clean, service: clean.topic === 'job' ? 'hire_me' : 'contact' },
        { emailCopy: CONTACT_EMAIL_BACKUP },
      );
      onQueued(conversation.id);
    } catch {
      // The browser won't store the queue. The email copy, sent right now, is the only way through.
      const emailed = CONTACT_EMAIL_BACKUP && (await postEmailCopy(clean)) === 'sent';
      setOutcome(emailed ? { kind: 'emailed', email: clean.email } : { kind: 'blocked', message: clean.message });
    } finally {
      setSubmitting(false);
    }
  }

  const done = outcome?.kind === 'emailed';

  return (
    // method="post" with form-name: if JavaScript never loads, the browser posts straight to Netlify Forms
    // instead of putting the visitor's details in the address bar.
    <form method="post" noValidate onSubmit={handleSubmit} className="max-w-measure space-y-6">
      <input type="hidden" name="form-name" value="contact" />
      <TextField
        ref={fieldRefs.name}
        id="contact-name"
        name="name"
        required
        maxLength={NAME_MAX}
        autoComplete="name"
        label={t('form.name.label')}
        placeholder={t('form.name.placeholder')}
        value={values.name}
        onChange={handleChange}
        error={errors.name ? t(`errors.${errors.name}`) : undefined}
      />
      <TextField
        ref={fieldRefs.email}
        id="contact-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        label={t('form.email.label')}
        hint={t('form.email.hint')}
        placeholder={t('form.email.placeholder')}
        value={values.email}
        onChange={handleChange}
        error={errors.email ? t(`errors.${errors.email}`) : undefined}
      />
      <Select
        id="contact-topic"
        name="topic"
        label={t('form.topic.label')}
        value={values.topic}
        onChange={handleChange}
        options={TOPICS.map((topic) => ({ value: topic, label: t(`form.topic.options.${topic}`) }))}
      />
      <TextArea
        ref={fieldRefs.message}
        id="contact-message"
        name="message"
        required
        maxLength={MESSAGE_MAX + 200}
        label={t('form.message.label')}
        hint={t('form.message.hint')}
        placeholder={t('form.message.placeholder')}
        value={values.message}
        onChange={handleChange}
        error={errors.message ? t(`errors.${errors.message}`) : undefined}
      />

      {/* Hidden from people, tempting to bots. A meaningless name so browsers never autofill it. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-bot-field">{t('form.honeypot')}</label>
        <input ref={honeypot} id="contact-bot-field" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {outcome?.kind === 'tooFast' ? (
        <StatusMessage tone="warning" focusRef={outcomeRef}>
          {t('errors.tooFast')}
        </StatusMessage>
      ) : null}
      {outcome?.kind === 'emailed' ? (
        <StatusMessage tone="success" title={t('status.emailedInstead.title')} focusRef={outcomeRef}>
          {t('status.emailedInstead.body', { email: outcome.email })}
        </StatusMessage>
      ) : null}
      {outcome?.kind === 'blocked' ? (
        <StatusMessage
          tone="error"
          title={t('status.storageBlocked.title')}
          action={<a href={mailtoLink(SITE.email, outcome.message)}>{t('status.emailInstead')}</a>}
          focusRef={outcomeRef}
        >
          {t('status.storageBlocked.body')}
        </StatusMessage>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit" disabled={submitting || done}>
          {submitting ? t('form.sending') : t('form.submit')}
        </Button>
        <p className="text-sm text-ink-muted">{t('form.privacy')}</p>
      </div>
    </form>
  );
}
