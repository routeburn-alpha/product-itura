import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { isThemeId } from '$lib/themes/index.js';

export const ratingsStorageKey = 'quiz-lab-theme-ratings';

/** @typedef {Record<string, number>} ThemeRatings */

/** @param {unknown} value */
function normalizeRating(value) {
	const rating = Number(value);
	if (!Number.isFinite(rating)) return 0;

	return Math.min(5, Math.max(0, Math.round(rating)));
}

/** @returns {ThemeRatings} */
function readRatings() {
	if (!browser) return {};

	try {
		const storedRatings = window.localStorage.getItem(ratingsStorageKey);
		if (!storedRatings) return {};

		const parsedRatings = JSON.parse(storedRatings);
		if (!parsedRatings || typeof parsedRatings !== 'object') return {};

		/** @type {ThemeRatings} */
		const ratings = {};

		for (const [themeId, rating] of Object.entries(parsedRatings)) {
			const normalizedRating = normalizeRating(rating);
			if (isThemeId(themeId) && normalizedRating > 0) {
				ratings[themeId] = normalizedRating;
			}
		}

		return ratings;
	} catch {
		return {};
	}
}

/** @param {ThemeRatings} ratings */
function persistRatings(ratings) {
	if (!browser) return;

	try {
		window.localStorage.setItem(ratingsStorageKey, JSON.stringify(ratings));
	} catch {
		// Ratings are nice-to-have feedback and should never block the UI.
	}
}

/**
 * @returns {{
 *   subscribe: import('svelte/store').Writable<ThemeRatings>['subscribe'];
 *   init: () => void;
 *   setRating: (themeId: unknown, rating: unknown) => void;
 *   clearRating: (themeId: unknown) => void;
 * }}
 */
function createRatingsStore() {
	const { subscribe, set, update } = writable(/** @type {ThemeRatings} */ ({}));
	let initialized = false;

	return {
		subscribe,
		init() {
			if (!browser || initialized) return;

			initialized = true;
			set(readRatings());
		},
		setRating(themeId, rating) {
			if (!isThemeId(themeId)) return;

			const normalizedRating = normalizeRating(rating);

			update((ratings) => {
				const nextRatings = { ...ratings };

				if (normalizedRating > 0) {
					nextRatings[themeId] = normalizedRating;
				} else {
					delete nextRatings[themeId];
				}

				persistRatings(nextRatings);
				return nextRatings;
			});
		},
		clearRating(themeId) {
			if (!isThemeId(themeId)) return;

			update((ratings) => {
				const nextRatings = { ...ratings };
				delete nextRatings[themeId];
				persistRatings(nextRatings);
				return nextRatings;
			});
		}
	};
}

export const ratingsStore = createRatingsStore();
