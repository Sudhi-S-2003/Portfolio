import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DB_NAME = 'portfolio-cache-db';
const DB_VERSION = 1;
const STORE_NAME = 'hireMe';
const CACHE_KEY = 'hireMeSession';
const CHAT_SESSION_MAP_KEY = 'portfolio-service-chat-sessions';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const openHireMeDb = () =>
	new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('IndexedDB unavailable'));
			return;
		}
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error || new Error('Failed to open DB'));
	});

const idbGet = async (key) => {
	const db = await openHireMeDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const request = store.get(key);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error || new Error('Failed to read cache'));
		tx.oncomplete = () => db.close();
	});
};

const idbSet = async (key, value) => {
	const db = await openHireMeDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		store.put(value, key);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			reject(tx.error || new Error('Failed to save cache'));
		};
	});
};

const idbDelete = async (key) => {
	const db = await openHireMeDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		store.delete(key);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			reject(tx.error || new Error('Failed to delete cache'));
		};
	});
};

const createSessionId = () => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `session-${Date.now()}`;
};

const getCachedHireSession = async () => {
	try {
		const cached = await idbGet(CACHE_KEY);
		const now = Date.now();
		if (!cached?.sid || !cached?.expiresAt || cached.expiresAt < now) {
			await idbDelete(CACHE_KEY);
			return null;
		}

		const sessionMapRaw = localStorage.getItem(CHAT_SESSION_MAP_KEY);
		const sessionMap = sessionMapRaw ? JSON.parse(sessionMapRaw) : {};
		if (!sessionMap?.[cached.sid]) {
			return null;
		}
		return cached;
	} catch (_error) {
		return null;
	}
};

const saveHireSession = async ({ sid, email }) => {
	const expiresAt = Date.now() + FIVE_DAYS_MS;
	await idbSet(CACHE_KEY, { sid, email, expiresAt });
};

const useHireMeChat = () => {
	const navigate = useNavigate();

	const openHireMeChat = useCallback(async () => {
		const cached = await getCachedHireSession();
		if (cached?.sid) {
			navigate(`/service/chat?sid=${encodeURIComponent(cached.sid)}`);
			return;
		}

		const inputEmail = window.prompt('Enter your email');
		if (!inputEmail) return;
		const email = inputEmail.trim();
		if (!email) return;

		const sid = createSessionId();
		try {
			await saveHireSession({ sid, email });
		} catch (_error) {
			// Continue flow even if cache write fails.
		}

		const chatParams = new URLSearchParams({
			service: 'hire_me',
			subject: `Hiring :${email}`,
			autocreate: '1',
			name: email,
			email,
			sid,
		});
		navigate(`/service/chat?${chatParams.toString()}`);
	}, [navigate]);

	return { openHireMeChat };
};

export default useHireMeChat;
