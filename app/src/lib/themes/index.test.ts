import { describe, expect, it } from 'vitest';
import { availableThemes, requiredThemeTokenNames, validateTheme } from './index.js';

const expectedMotionTokens = [
	'--motion-fast',
	'--motion-medium',
	'--motion-slow',
	'--motion-ease-out',
	'--motion-ease-in-out',
	'--motion-ease',
	'--motion-duration-hover',
	'--motion-duration-focus',
	'--motion-duration-feedback',
	'--motion-duration-progress',
	'--motion-duration-entry',
	'--motion-duration-exit',
	'--motion-duration-loading',
	'--motion-ease-standard',
	'--motion-ease-emphasized'
];

describe('theme motion tokens', () => {
	it('defines the required motion scale and semantic aliases', () => {
		for (const token of expectedMotionTokens) {
			expect(requiredThemeTokenNames).toContain(token);
		}
	});

	it('keeps all bundled theme token maps compatible', () => {
		for (const theme of availableThemes) {
			expect(validateTheme(theme)).toMatchObject({
				valid: true,
				missingTokens: [],
				extraTokens: []
			});
		}
	});

	it('uses the requested animation timing scale', () => {
		for (const theme of availableThemes) {
			expect(theme.tokens['--motion-fast']).toBe('150ms');
			expect(theme.tokens['--motion-medium']).toBe('250ms');
			expect(theme.tokens['--motion-slow']).toBe('400ms');
		}
	});
});
