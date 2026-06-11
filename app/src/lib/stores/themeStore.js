import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import {
	DEFAULT_THEME_ID,
	applyTheme,
	getSystemThemeId,
	isThemeId,
	resolveThemeId
} from '$lib/themes/index.js';

export const themeStorageKey = 'quiz-lab-theme';

/** @returns {string} */
function readStoredThemeId() {
	if (!browser) return '';

	try {
		const storedThemeId = window.localStorage.getItem(themeStorageKey);
		if (!storedThemeId) return '';

		if (isThemeId(storedThemeId)) return storedThemeId;

		window.localStorage.removeItem(themeStorageKey);
	} catch {
		return '';
	}

	return '';
}

/** @returns {string} */
function getSystemPreferredThemeId() {
	if (!browser || typeof window.matchMedia !== 'function') return DEFAULT_THEME_ID;

	return getSystemThemeId(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

/** @returns {string} */
function getInitialThemeId() {
	return readStoredThemeId() || getSystemPreferredThemeId();
}

/**
 * @returns {{
 *   subscribe: import('svelte/store').Writable<string>['subscribe'];
 *   init: () => string;
 *   setTheme: (themeId: unknown) => string;
 *   clearThemePreference: () => string;
 *   watchSystemPreference: () => () => void;
 * }}
 */
function createThemeStore() {
	const { subscribe, set } = writable(DEFAULT_THEME_ID);
	let initialized = false;
	let stopSystemPreferenceWatch = () => {};

	/**
	 * @param {unknown} themeId
	 * @param {boolean} [persist]
	 */
	function commitTheme(themeId, persist = false) {
		const resolvedThemeId = resolveThemeId(themeId);

		if (browser) {
			applyTheme(resolvedThemeId);

			if (persist) {
				try {
					window.localStorage.setItem(themeStorageKey, resolvedThemeId);
				} catch {
					// The visual theme can still switch when localStorage is unavailable.
				}
			}
		}

		set(resolvedThemeId);
		return resolvedThemeId;
	}

	return {
		subscribe,
		init() {
			if (!browser) return DEFAULT_THEME_ID;

			const themeId = getInitialThemeId();
			initialized = true;
			return commitTheme(themeId);
		},
		setTheme(themeId) {
			initialized = true;
			return commitTheme(themeId, true);
		},
		clearThemePreference() {
			if (browser) {
				try {
					window.localStorage.removeItem(themeStorageKey);
				} catch {
					// Ignore storage failures; the store still falls back to system preference.
				}
			}

			return commitTheme(getSystemPreferredThemeId());
		},
		watchSystemPreference() {
			if (!browser || typeof window.matchMedia !== 'function') return () => {};

			stopSystemPreferenceWatch();

			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleSystemThemeChange = () => {
				if (readStoredThemeId()) return;
				commitTheme(getSystemThemeId(mediaQuery.matches));
			};

			if (typeof mediaQuery.addEventListener === 'function') {
				mediaQuery.addEventListener('change', handleSystemThemeChange);
				stopSystemPreferenceWatch = () => {
					mediaQuery.removeEventListener('change', handleSystemThemeChange);
				};
			} else {
				mediaQuery.addListener(handleSystemThemeChange);
				stopSystemPreferenceWatch = () => {
					mediaQuery.removeListener(handleSystemThemeChange);
				};
			}

			if (!initialized) {
				commitTheme(getInitialThemeId());
			}

			return stopSystemPreferenceWatch;
		}
	};
}

export const themeStore = createThemeStore();
