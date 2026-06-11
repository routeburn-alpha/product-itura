import { darkModeTheme } from './darkMode.js';
import { defaultTheme } from './default.js';
import { highContrastTheme } from './highContrast.js';
import { purpleTheme } from './purple.js';

/**
 * @typedef {Object} Theme
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} [colorScheme]
 * @property {Record<string, string>} previewColors
 * @property {Record<string, string>} tokens
 */

export const DEFAULT_THEME_ID = defaultTheme.id;

/** @type {Record<string, Theme>} */
export const themes = {
	[defaultTheme.id]: defaultTheme,
	[darkModeTheme.id]: darkModeTheme,
	[purpleTheme.id]: purpleTheme,
	[highContrastTheme.id]: highContrastTheme
};

export const availableThemes = Object.values(themes);
export const requiredThemeTokenNames = Object.keys(defaultTheme.tokens);

/** @type {Set<string>} */
let appliedTokenNames = new Set();

/**
 * @param {unknown} themeId
 * @returns {themeId is string}
 */
export function isThemeId(themeId) {
	return typeof themeId === 'string' && Object.hasOwn(themes, themeId);
}

/**
 * @param {unknown} themeId
 * @returns {string}
 */
export function resolveThemeId(themeId) {
	return isThemeId(themeId) ? themeId : DEFAULT_THEME_ID;
}

/**
 * @param {unknown} themeId
 * @returns {Theme}
 */
export function getTheme(themeId) {
	return themes[resolveThemeId(themeId)];
}

/**
 * @param {boolean} prefersDark
 * @returns {string}
 */
export function getSystemThemeId(prefersDark) {
	return prefersDark ? darkModeTheme.id : DEFAULT_THEME_ID;
}

/**
 * @param {Partial<Theme> | null | undefined} theme
 */
export function validateTheme(theme) {
	const missingTokens = requiredThemeTokenNames.filter(
		(tokenName) => typeof theme?.tokens?.[tokenName] !== 'string'
	);
	const extraTokens = Object.keys(theme?.tokens ?? {}).filter(
		(tokenName) => !requiredThemeTokenNames.includes(tokenName)
	);

	return {
		valid:
			typeof theme?.id === 'string' &&
			typeof theme?.name === 'string' &&
			typeof theme?.tokens === 'object' &&
			missingTokens.length === 0,
		missingTokens,
		extraTokens
	};
}

/**
 * @param {unknown} themeId
 * @param {HTMLElement} [targetRoot]
 * @returns {Theme}
 */
export function applyTheme(themeId, targetRoot) {
	const theme = getTheme(themeId);
	const validation = validateTheme(theme);

	if (!validation.valid) {
		console.warn(`Theme "${theme.id}" is missing required tokens.`, validation.missingTokens);
	}

	const root =
		targetRoot ??
		(typeof document === 'undefined' ? undefined : document.documentElement);

	if (!root) return theme;

	for (const tokenName of appliedTokenNames) {
		if (!Object.hasOwn(theme.tokens, tokenName)) {
			root.style.removeProperty(tokenName);
		}
	}

	for (const [tokenName, tokenValue] of Object.entries(theme.tokens)) {
		root.style.setProperty(tokenName, tokenValue);
	}

	root.dataset.theme = theme.id;
	root.style.colorScheme = theme.colorScheme ?? 'light';
	appliedTokenNames = new Set(Object.keys(theme.tokens));

	return theme;
}
