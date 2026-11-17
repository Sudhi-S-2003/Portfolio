import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Section } from '../components/layout/Section';
import { SITE } from '../data/site';
import { hasLegacySessions, hasStoredConversation, isQueuePending } from '../features/chat-queue/flags';
import { findLatestConversationId } from '../features/chat-queue/lookup';
import { ContactForm } from '../features/contact/ContactForm';
import { ConversationPanel } from '../features/contact/ConversationPanel';
import { isContactTopic } from '../features/contact/validation';
import { useHydrated } from '../lib/useHydrated';

export default function Contact() {
  const { t } = useTranslation(['contact', 'common']);
  const [params, setParams] = useSearchParams();
  // The static HTML is the plain form; query-string state appears right after hydration.
  const hydrated = useHydrated();
  const sid = hydrated ? params.get('sid') : null;
  const topicParam = hydrated ? params.get('topic') : null;
  const topic = isContactTopic(topicParam) ? topicParam : 'job';
  // A returning visitor gets their latest conversation back, even without the ?sid= link.
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [wantsNewMessage, setWantsNewMessage] = useState(false);
  const conversationId = sid ?? (wantsNewMessage ? null : restoredId);

  useEffect(() => {
    // The queue code (and Dexie) loads only when there is something to send or to show.
    if (isQueuePending() || hasLegacySessions() || hasStoredConversation()) {
      void import('../features/chat-queue/boot').then(({ ensureQueueWorker }) => ensureQueueWorker());
    }
  }, []);

  useEffect(() => {
    if (!hydrated || sid || wantsNewMessage) return;
    let cancelled = false;
    void findLatestConversationId().then((id) => {
      if (!cancelled) setRestoredId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, sid, wantsNewMessage]);

  function startNewMessage() {
    setWantsNewMessage(true);
    setParams({}, { replace: true });
  }

  function showConversation(id: string) {
    setWantsNewMessage(false);
    void import('../features/chat-queue/boot').then(({ ensureQueueWorker }) => ensureQueueWorker());
    setParams({ sid: id }, { replace: true });
  }

  return (
    <>
      <header className="max-w-measure pt-6 pb-10 sm:pt-10 lg:pt-16">
        <h1 className="text-4xl sm:text-5xl">{t('title')}</h1>
        <p className="mt-5 text-lg text-ink-muted">{t('lead')}</p>
      </header>

      <Section label={conversationId ? t('sections.conversation') : t('sections.form')}>
        {conversationId ? (
          <ConversationPanel id={conversationId} onNewMessage={startNewMessage} />
        ) : (
          <ContactForm key={topic} initialTopic={topic} onQueued={showConversation} />
        )}
      </Section>

      <Section label={t('sections.elsewhere')}>
        <ul className="space-y-2">
          <li>
            <span className="meta mr-3">{t('elsewhere.email')}</span>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </li>
          <li>
            <span className="meta mr-3">{t('elsewhere.linkedin')}</span>
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
              {SITE.linkedinLabel}
              <span className="sr-only"> ({t('common:actions.opensInNewTab')})</span>
            </a>
          </li>
          <li>
            <span className="meta mr-3">{t('elsewhere.github')}</span>
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              {SITE.githubLabel}
              <span className="sr-only"> ({t('common:actions.opensInNewTab')})</span>
            </a>
          </li>
        </ul>
        <p className="mt-5 max-w-measure text-ink-muted">{t('elsewhere.location')}</p>
      </Section>
    </>
  );
}
