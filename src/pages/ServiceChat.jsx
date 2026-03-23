import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SESSION_STORAGE_KEY = 'portfolio-service-chat-sessions';
const DEFAULT_IFRAME_SRC = 'about:blank';
const API_BASE = 'https://nutrify-backend-z5vr.onrender.com';
const MIN_REQUIRED_TEXT_LENGTH = 2;

const getQueryParams = () => {
	const params = new URLSearchParams(window.location.search);
	return {
		sessionId: params.get('sid') || '',
		service: params.get('service') || '',
		subject: params.get('subject') || '',
		name: params.get('name') || '',
		email: params.get('email') || '',
		message: params.get('message') || '',
		autoCreate: params.get('autocreate') === '1',
	};
};

const INITIAL_MESSAGE_TEMPLATES = {
	contact: ({ externalName, externalEmail, subject, initialMessage }) => [
		'New Contact Request',
		`Name: ${externalName}`,
		externalEmail ? `Email: ${externalEmail}` : '',
		`Subject: ${subject}`,
		'Message:',
		initialMessage,
	],
	hire_me: ({ externalName, externalEmail, subject, initialMessage }) => [
		'Hire Me Request',
		`Candidate: ${externalName}`,
		externalEmail ? `Email: ${externalEmail}` : '',
		`Topic: ${subject}`,
		initialMessage ? `Context: ${initialMessage}` : '',
	],
	default: ({ externalName, externalEmail, subject, initialMessage }) => [
		'Service Request',
		`Name: ${externalName}`,
		externalEmail ? `Email: ${externalEmail}` : '',
		`Subject: ${subject}`,
		'Message:',
		initialMessage,
	],
};

const buildInitialChatMessage = ({
	service,
	externalName,
	externalEmail,
	subject,
	initialMessage,
}) => {
	const normalizedService = (service || '').trim().toLowerCase();
	const formatter =
		INITIAL_MESSAGE_TEMPLATES[normalizedService] || INITIAL_MESSAGE_TEMPLATES.default;

	return formatter({
		externalName: externalName.trim(),
		externalEmail: externalEmail.trim(),
		subject: subject.trim(),
		initialMessage: initialMessage.trim(),
	})
		.filter(Boolean)
		.join('\n')
		.trim();
};

const getOrCreateSessionId = (existingSessionId) => {
	if (existingSessionId) return existingSessionId;
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `session-${Date.now()}`;
};

const readSessionMap = () => {
	try {
		const raw = localStorage.getItem(SESSION_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (_error) {
		return {};
	}
};

const writeSessionIframeSrc = (sessionId, src) => {
	if (!sessionId || !src) return;
	const map = readSessionMap();
	map[sessionId] = src;
	localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
};

const clearInitQueryParams = () => {
	const url = new URL(window.location.href);
	['service', 'subject', 'name', 'email', 'message', 'autocreate'].forEach((key) =>
		url.searchParams.delete(key),
	);
	window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

const syncSessionIdInUrl = (sessionId) => {
	if (!sessionId) return;
	const url = new URL(window.location.href);
	if (url.searchParams.get('sid') === sessionId) return;
	url.searchParams.set('sid', sessionId);
	window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

const ServiceChat = () => {
	const frontendBase = 'https://nutrify-frontend.onrender.com';
	const apiKey = 'nk_5d72aae6fb80fc2dfb42959d';
	const apiSecret = 'ns_Fxq3fzQfo1pSqVawrJKZ5QTJW1Mwi1JD';
	const [sessionId, setSessionId] = useState('');
	const [serviceType, setServiceType] = useState('');
	const [subject, setSubject] = useState('Project chat request');
	const [externalName, setExternalName] = useState('Portfolio guest');
	const [externalEmail, setExternalEmail] = useState('');
	const [initialMessage, setInitialMessage] = useState('');
	const [autoCreateRequested, setAutoCreateRequested] = useState(false);
	const [iframeSrc, setIframeSrc] = useState(DEFAULT_IFRAME_SRC);
	const [createError, setCreateError] = useState('');
	const [createSuccess, setCreateSuccess] = useState('');
	const initialMessageSentRef = useRef(false);

	useEffect(() => {
		const query = getQueryParams();
		const sid = getOrCreateSessionId(query.sessionId);
		setSessionId(sid);
		syncSessionIdInUrl(sid);

		const storedIframeSrc = readSessionMap()[sid];
		if (storedIframeSrc) {
			setIframeSrc(storedIframeSrc);
		}

		// Query-driven API creation should happen only once (initial flow).
		const hasInitialQueryData =
			Boolean(query.service) ||
			Boolean(query.subject) ||
			Boolean(query.name) ||
			Boolean(query.email) ||
			Boolean(query.message) ||
			query.autoCreate;
		if (query.service) setServiceType(query.service);
		if (query.subject) setSubject(query.subject);
		if (query.email) setExternalEmail(query.email);
		if (query.name) {
			setExternalName(query.name);
		} else if (query.email) {
			setExternalName(query.email);
		}
		if (query.message) setInitialMessage(query.message);
		if (!storedIframeSrc && hasInitialQueryData) {
			setAutoCreateRequested(true);
		}
	}, []);

	const apiHeaders = useMemo(
		() => ({
			'Content-Type': 'application/json',
			'X-API-Key': apiKey.trim(),
			'X-API-Secret': apiSecret.trim(),
		}),
		[apiKey, apiSecret],
	);

	const apiUrl = (path) => {
		const safePath = path.startsWith('/') ? path : `/${path}`;
		return `${API_BASE}${safePath}`;
	};

	const effectiveGuestUrl = (rawGuestUrl) => {
		if (!rawGuestUrl) return '';
		try {
			const original = new URL(rawGuestUrl);
			const desired = new URL((frontendBase || 'http://localhost:5173').trim());
			original.protocol = desired.protocol;
			original.host = desired.host;
			return original.toString();
		} catch (_error) {
			return rawGuestUrl;
		}
	};


	const createChat = useCallback(async () => {
		setCreateError('');
		setCreateSuccess('');
		
		if (!apiKey.trim() || !apiSecret.trim()) {
			setCreateError('Enter X-API-Key and X-API-Secret.');
			return;
		}
		if (
			subject.trim().length < MIN_REQUIRED_TEXT_LENGTH ||
			externalName.trim().length < MIN_REQUIRED_TEXT_LENGTH
		) {
			setCreateError(
				`Subject and external name must be at least ${MIN_REQUIRED_TEXT_LENGTH} characters.`,
			);
			return;
		}

		try {
			const res = await fetch(apiUrl('/external/v1/chats'), {
				method: 'POST',
				headers: apiHeaders,
				body: JSON.stringify({
					subject: subject.trim(),
					threadTitle: initialMessage.trim(),
					externalName: externalName.trim(),
					externalEmail: externalEmail.trim() || undefined,
				}),
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok || !json.success) {
				throw new Error(json.message || `Create chat failed (${res.status})`);
			}

			const data = json.data || {};
			const fixedUrl = effectiveGuestUrl(data.guestUrl || '');
			const nextIframeSrc = fixedUrl || data.guestUrl || DEFAULT_IFRAME_SRC;

			setIframeSrc(nextIframeSrc);
			writeSessionIframeSrc(sessionId, nextIframeSrc);
			clearInitQueryParams();
			setCreateSuccess('Chat created successfully and loaded in iframe.');
		} catch (error) {
			setCreateError(error.message || String(error));
		}
	}, [
		apiHeaders,
		apiKey,
		apiSecret,
		externalEmail,
		externalName,
		frontendBase,
		initialMessage,
		sessionId,
		subject,
	]);

	const sendInitialQueryMessage = useCallback(async () => {
		if (initialMessageSentRef.current) return;
		if (!initialMessage.trim()) return;
		if (!iframeSrc || iframeSrc === DEFAULT_IFRAME_SRC) return;

		let token = '';
		try {
			const iframeUrl = new URL(iframeSrc);
			token =
				iframeUrl.searchParams.get('token') ||
				iframeUrl.searchParams.get('guestToken') ||
				iframeUrl.searchParams.get('chatToken') ||
				'';
		} catch (_error) {
			token = '';
		}
		if (!token) return;

		initialMessageSentRef.current = true;
		const combinedMessage = buildInitialChatMessage({
			service: serviceType,
			externalName,
			externalEmail,
			subject,
			initialMessage,
		});
		if (!combinedMessage) return;
		try {
			await fetch(apiUrl('/public/service-chat/message'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					text: combinedMessage,
				}),
			});
		} catch (_error) {
			// Keep iframe flow uninterrupted if initial message API fails.
		} finally {
			clearInitQueryParams();
		}
	}, [externalEmail, externalName, iframeSrc, initialMessage, serviceType, subject]);

	useEffect(() => {
		if (!autoCreateRequested) return;
		if (!sessionId) return;
		if (!apiKey.trim() || !apiSecret.trim()) return;
		createChat();
		setAutoCreateRequested(false);
	}, [autoCreateRequested, apiKey, apiSecret, sessionId, createChat]);

	useEffect(() => {
		sendInitialQueryMessage();
	}, [sendInitialQueryMessage]);

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="fixed inset-0 z-[9999] h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden"
		>
			<div className="h-full w-full bg-white dark:bg-gray-800">
				{createError ? (
					<p className="absolute left-3 top-3 z-10 rounded bg-white/90 px-3 py-2 text-sm text-red-600 shadow dark:bg-gray-900/90 dark:text-red-400">
						{createError}
					</p>
				) : null}
				{createSuccess ? (
					<p className="absolute left-3 top-3 z-10 rounded bg-white/90 px-3 py-2 text-sm text-emerald-600 shadow dark:bg-gray-900/90 dark:text-emerald-400">
						{createSuccess}
					</p>
				) : null}
				<iframe
					title="Guest service chat"
					src={iframeSrc}
					className="block w-full h-full border-0 bg-gray-50"
				/>
			</div>
		</motion.section>
	);
};

export default ServiceChat;
