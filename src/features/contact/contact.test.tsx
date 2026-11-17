import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../../test/render';
import { getDb } from '../chat-queue/db';
import { enqueueConversation } from '../chat-queue/queue';
import { validateContact } from './validation';

// The background worker would call the network; these tests only look at the page.
vi.mock('../chat-queue/boot', () => ({ ensureQueueWorker: vi.fn(async () => {}) }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response('', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await getDb().conversations.clear();
  await getDb().outbox.clear();
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Your name'), 'Asha Menon');
  await user.type(screen.getByLabelText('Email'), 'asha@example.com');
  await user.type(screen.getByLabelText('Message'), 'We have a backend role open in Kochi.');
  // A person takes longer than the 2-second bot check; move the clock on like a real visit.
  const later = Date.now() + 10_000;
  vi.spyOn(Date, 'now').mockReturnValue(later);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('validateContact', () => {
  it('returns a key for each problem', () => {
    expect(validateContact({ name: '', email: 'x', topic: 'job', message: 'short' })).toEqual({
      name: 'nameRequired',
      email: 'emailInvalid',
      message: 'messageTooShort',
    });
    expect(validateContact({ name: 'Asha', email: 'a@b.co', topic: 'job', message: 'Long enough message' })).toEqual({});
  });
});

describe('contact form', () => {
  it('explains every problem and moves focus to the first one', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />, { route: '/contact' });
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Write a short message.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveFocus();
  });

  it('saves the message and shows it straight away, with an email copy queued', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />, { route: '/contact?topic=job' });
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Message saved')).toBeInTheDocument();
    expect(screen.getByText('We have a backend role open in Kochi.')).toBeInTheDocument();
    const saved = await getDb().conversations.toArray();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ service: 'hire_me', topic: 'job', email: 'asha@example.com', emailCopy: 'pending' });
    const kinds = (await getDb().outbox.toArray()).map((job) => job.kind).sort();
    expect(kinds).toEqual(['create-chat', 'email-copy']);
  });

  it('moves focus to the confirmation after sending, so keyboard and screen-reader users hear it', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />, { route: '/contact' });
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    await screen.findByText('Message saved');
    await vi.waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement?.closest('[role="status"], [role="alert"]')).toHaveTextContent('Message saved');
    });
  });

  it('shows a returning visitor their conversation without needing the old link', async () => {
    await enqueueConversation(getDb(), {
      service: 'contact',
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'other',
      message: 'Sent on Monday, back on Wednesday.',
    });
    const user = userEvent.setup();
    await renderWithProviders(<App />, { route: '/contact' });
    expect(await screen.findByText('Sent on Monday, back on Wednesday.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send another message' }));
    expect(await screen.findByLabelText('Your name')).toBeInTheDocument();
  });

  it('says "Message received" even when the chat refused it, if the email copy got through', async () => {
    const conversation = await enqueueConversation(getDb(), {
      service: 'contact',
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'other',
      message: 'A message the chat server rejected.',
    });
    await getDb().conversations.update(conversation.id, { status: 'failed', emailCopy: 'sent' });
    await renderWithProviders(<App />, { route: `/contact?sid=${conversation.id}` });
    expect(await screen.findByText('Message received')).toBeInTheDocument();
  });

  it('says "Message received" as soon as the email copy lands, even while the chat server is down', async () => {
    const conversation = await enqueueConversation(getDb(), {
      service: 'hire_me',
      name: 'Asha',
      email: 'asha@example.com',
      topic: 'job',
      message: 'Still trying to reach you.',
    });
    await getDb().conversations.update(conversation.id, { status: 'waking', attempts: 1, emailCopy: 'sent' });
    await renderWithProviders(<App />, { route: `/contact?sid=${conversation.id}` });
    expect(await screen.findByText('Message received')).toBeInTheDocument();
    expect(screen.getByText(/got your message and will reply to asha@example.com/)).toBeInTheDocument();
    expect(screen.queryByText('The chat server is still down')).not.toBeInTheDocument();
  });

  it('after five failed tries with no email copy, offers email and LinkedIn', async () => {
    const conversation = await enqueueConversation(getDb(), {
      service: 'contact',
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'other',
      message: 'Hello again from Kochi.',
    });
    await getDb().conversations.update(conversation.id, { status: 'waking', attempts: 5, emailCopy: 'failed' });
    await renderWithProviders(<App />, { route: `/contact?sid=${conversation.id}` });
    expect(await screen.findByText('The chat server is still down')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email me instead' })).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    expect(screen.getByRole('link', { name: /Message me on LinkedIn/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/sudhi-s-a2a4ab30b',
    );
  });

  it('presets the topic from the link', async () => {
    await renderWithProviders(<App />, { route: '/contact?topic=freelance' });
    expect(await screen.findByLabelText('What is it about?')).toHaveValue('freelance');
  });

  it('ignores submissions that fill the hidden spam field', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />, { route: '/contact' });
    await fillValidForm(user);
    await user.type(screen.getByLabelText('Leave this field empty'), 'bot text');
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await getDb().conversations.count()).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reopens an existing conversation from ?sid=', async () => {
    const conversation = await enqueueConversation(getDb(), {
      service: 'contact',
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'other',
      message: 'Just saying hello from Kochi.',
    });
    await renderWithProviders(<App />, { route: `/contact?sid=${conversation.id}` });
    expect(await screen.findByText('Just saying hello from Kochi.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send another message' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Your conversation' })).toBeInTheDocument();
  });

  it('says so when a conversation has expired', async () => {
    await renderWithProviders(<App />, { route: '/contact?sid=gone' });
    expect(await screen.findByText('This conversation has ended')).toBeInTheDocument();
  });
});

describe('old chat links', () => {
  it('send /service/chat?sid= to the conversation on the contact page', async () => {
    const conversation = await enqueueConversation(getDb(), {
      service: 'hire_me',
      name: 'Asha',
      email: 'asha@example.com',
      topic: 'job',
      message: 'Following up on our chat.',
    });
    await renderWithProviders(<App />, { route: `/service/chat?sid=${conversation.id}` });
    expect(await screen.findByText('Following up on our chat.')).toBeInTheDocument();
  });
});
