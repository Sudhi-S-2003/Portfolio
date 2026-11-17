import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { StatusMessage, type StatusTone } from '../../components/ui/StatusMessage';
import { SITE } from '../../data/site';
import type { Conversation, ConversationStatus } from '../chat-queue/db';
import { isStalled } from '../chat-queue/policy';
import { useConversation } from '../chat-queue/useConversation';
import { mailtoLink } from './emailCopy';

const TONES: Record<ConversationStatus, StatusTone> = {
  queued: 'info',
  waking: 'info',
  created: 'info',
  delivered: 'success',
  failed: 'error',
};

function OtherWays({ conversation, withLinkedIn }: { conversation: Conversation; withLinkedIn: boolean }) {
  const { t } = useTranslation(['contact', 'common']);
  return (
    <span className="flex flex-wrap gap-x-6 gap-y-2">
      <a href={mailtoLink(SITE.email, conversation.message)}>{t('status.emailInstead')}</a>
      {withLinkedIn ? (
        <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
          {t('status.linkedinInstead')}
          <span className="sr-only"> ({t('common:actions.opensInNewTab')})</span>
        </a>
      ) : null}
    </span>
  );
}

/**
 * Move focus to the status message whenever what it says changes, so it is announced, but never pull focus
 * away from something the visitor is using (the chat, a link, a field).
 */
function useFocusOnChange(view: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    if (!active || active === document.body || active === ref.current) ref.current?.focus({ preventScroll: true });
  }, [view]);
  return ref;
}

/** What happened to a message, in plain words, then the chat itself once it exists. */
export function ConversationPanel({ id, onNewMessage }: { id: string; onNewMessage: () => void }) {
  const { t } = useTranslation(['contact', 'common']);
  const { conversation, loading } = useConversation(id);
  const stalled = conversation ? isStalled(conversation) : false;
  const received = conversation?.status !== 'delivered' && conversation?.emailCopy === 'sent';
  const view = loading
    ? 'loading'
    : !conversation
      ? 'notFound'
      : received
        ? 'received'
        : stalled
          ? 'stalled'
          : conversation.status;
  const statusRef = useFocusOnChange(view);

  if (loading) {
    return (
      <p role="status" className="text-ink-muted">
        {t('status.loading')}
      </p>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-measure space-y-5">
        <StatusMessage tone="info" title={t('status.notFound.title')} focusRef={statusRef}>
          {t('status.notFound.body')}
        </StatusMessage>
        <Button variant="secondary" onClick={onNewMessage}>
          {t('status.newMessage')}
        </Button>
      </div>
    );
  }

  const { status } = conversation;
  const showChat = (status === 'created' || status === 'delivered') && conversation.guestUrl;

  let statusMessage;
  if (received) {
    // The chat server is often down (or may even refuse a message), but the email copy is the route that
    // matters: once it lands, say so.
    statusMessage = (
      <StatusMessage tone="success" title={t('status.received.title')} focusRef={statusRef}>
        {t('status.received.body', { email: conversation.email })}
      </StatusMessage>
    );
  } else if (stalled) {
    // Five failed tries and no email copy yet: say plainly what to do instead.
    const bodyKey = conversation.emailCopy === 'pending' ? 'status.stalled.bodyPending' : 'status.stalled.bodyFailed';
    statusMessage = (
      <StatusMessage
        tone="warning"
        title={t('status.stalled.title')}
        action={<OtherWays conversation={conversation} withLinkedIn />}
        focusRef={statusRef}
      >
        {t(bodyKey)}
      </StatusMessage>
    );
  } else {
    const showEmailInstead = status === 'waking' || status === 'failed';
    statusMessage = (
      <StatusMessage
        tone={TONES[status]}
        title={t(`status.${status}.title`)}
        action={showEmailInstead ? <OtherWays conversation={conversation} withLinkedIn={status === 'failed'} /> : undefined}
        focusRef={statusRef}
      >
        {t(`status.${status}.body`, { name: conversation.name })}
      </StatusMessage>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-measure">{statusMessage}</div>

      {conversation.message ? (
        <figure className="max-w-measure border-l-2 border-line-strong pl-4">
          <figcaption className="meta">{t('status.yourMessage')}</figcaption>
          {/* overflow-wrap: anywhere, so one very long word (a pasted link, "ddddd…") wraps instead of overflowing. */}
          <blockquote className="mt-1 whitespace-pre-line text-ink [overflow-wrap:anywhere]">{conversation.message}</blockquote>
        </figure>
      ) : null}

      {showChat ? (
        <div className="space-y-2">
          <iframe
            title={t('status.chatTitle')}
            src={conversation.guestUrl}
            className="h-[34rem] w-full rounded-ui border border-line bg-paper-raised"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          <a href={conversation.guestUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
            {t('status.openChat')}
            <span className="sr-only"> ({t('common:actions.opensInNewTab')})</span>
          </a>
        </div>
      ) : null}

      <Button variant="quiet" onClick={onNewMessage}>
        {t('status.newMessage')}
      </Button>
    </div>
  );
}
