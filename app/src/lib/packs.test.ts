import { describe, expect, it } from 'vitest';
import { getPack, listPacks } from './packs';

describe('pack data loading', () => {
	it('lists bundled packs in title order', () => {
		const packs = listPacks();

		expect(packs.map((pack) => pack.id)).toEqual(['nyt-easy', 'premier-league']);
		expect(packs.every((pack) => pack.questions.length > 0)).toBe(true);
	});

	it('returns a single pack by id', () => {
		const pack = getPack('nyt-easy');

		expect(pack?.title).toBe('Easy Mini-Style Trivia');
		expect(pack?.questions[0]?.prompt).toContain('Tropical');
	});

	it('returns null for a missing pack', () => {
		expect(getPack('missing-pack')).toBeNull();
	});
});
