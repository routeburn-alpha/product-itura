import { describe, expect, it } from 'vitest';
import { getPack, listPacks } from './packs';

const ideaPackIds = new Set([
	'general-knowledge-grab-bag',
	'pop-culture-warm-up',
	'sports-starter-pack',
	'world-geography-tour',
	'historys-greatest-hits',
	'science-all-around-us',
	'food-travel-and-culture',
	'deep-cut-pop-culture',
	'records-firsts-and-oddities',
	'championship-trivia'
]);

const beginnerPackIds = new Set([
	'general-knowledge-grab-bag',
	'pop-culture-warm-up',
	'sports-starter-pack'
]);

const intermediatePackIds = new Set([
	'world-geography-tour',
	'historys-greatest-hits',
	'science-all-around-us',
	'food-travel-and-culture'
]);

const advancedPackIds = new Set([
	'deep-cut-pop-culture',
	'records-firsts-and-oddities',
	'championship-trivia'
]);

function getQuestionType(question: Record<string, unknown>) {
	if (
		question.type === 'multiple-choice' ||
		question.type === 'true-false' ||
		question.type === 'fill-blank'
	) {
		return question.type;
	}

	return 'multiple-choice';
}

describe('pack data loading', () => {
	it('lists bundled packs in title order', () => {
		const packs = listPacks();

		expect(packs.map((pack) => pack.id)).toEqual([
			'championship-trivia',
			'deep-cut-pop-culture',
			'nyt-easy',
			'food-travel-and-culture',
			'general-knowledge-grab-bag',
			'historys-greatest-hits',
			'pop-culture-warm-up',
			'premier-league',
			'records-firsts-and-oddities',
			'science-all-around-us',
			'sports-starter-pack',
			'world-geography-tour'
		]);
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

describe('published quiz packs', () => {
	const packs = listPacks();

	it('includes the idea 4 pack set', () => {
		const packIds = new Set(packs.map((pack) => pack.id));

		for (const packId of ideaPackIds) {
			expect(packIds.has(packId), `missing ${packId}`).toBe(true);
		}
	});

	it('keeps pack and question identifiers unique', () => {
		expect(new Set(packs.map((pack) => pack.id)).size).toBe(packs.length);

		for (const pack of packs) {
			expect(new Set(pack.questions.map((question) => question.id)).size, pack.id).toBe(
				pack.questions.length
			);
		}
	});

	it('keeps each question playable', () => {
		for (const pack of packs) {
			for (const rawQuestion of pack.questions) {
				const question = rawQuestion as Record<string, unknown>;
				const type = getQuestionType(question);

				expect(question.id, `${pack.id} question id`).toEqual(expect.any(String));
				expect(question.prompt, `${pack.id} prompt`).toEqual(expect.any(String));
				expect(question.explanation, `${pack.id} explanation`).toEqual(expect.any(String));
				expect(question.difficulty, `${pack.id} difficulty`).toBeGreaterThanOrEqual(1);
				expect(question.difficulty, `${pack.id} difficulty`).toBeLessThanOrEqual(3);

				if (type === 'multiple-choice') {
					expect(Array.isArray(question.choices), `${pack.id} choices`).toBe(true);
					expect((question.choices as unknown[]).length, `${pack.id} choices`).toBeGreaterThan(1);
					expect(Number.isInteger(question.correctIndex), `${pack.id} correct index`).toBe(true);
					expect(question.correctIndex as number, `${pack.id} correct index`).toBeGreaterThanOrEqual(0);
					expect(question.correctIndex as number, `${pack.id} correct index`).toBeLessThan(
						(question.choices as unknown[]).length
					);
				}

				if (type === 'true-false') {
					expect(question.trueFalseAnswer, `${pack.id} true/false answer`).toEqual(
						expect.any(Boolean)
					);
				}

				if (type === 'fill-blank') {
					expect(question.blankAnswer, `${pack.id} blank answer`).toEqual(expect.any(String));
					expect(String(question.blankAnswer).trim().length, `${pack.id} blank answer`).toBeGreaterThan(
						0
					);
				}
			}
		}
	});

	it('matches the idea 4 trivia difficulty and naming requirements', () => {
		const ideaPacks = packs.filter((pack) => ideaPackIds.has(pack.id));

		expect(ideaPacks.filter((pack) => beginnerPackIds.has(pack.id))).toHaveLength(3);
		expect(ideaPacks.filter((pack) => intermediatePackIds.has(pack.id))).toHaveLength(4);
		expect(ideaPacks.filter((pack) => advancedPackIds.has(pack.id))).toHaveLength(3);

		for (const pack of ideaPacks) {
			const tier = beginnerPackIds.has(pack.id)
				? 'Beginner'
				: intermediatePackIds.has(pack.id)
					? 'Intermediate'
					: 'Advanced';
			const expectedDifficulty = tier === 'Beginner' ? 1 : tier === 'Intermediate' ? 2 : 3;
			const [minQuestions, maxQuestions] =
				tier === 'Beginner' ? [8, 12] : tier === 'Intermediate' ? [10, 15] : [12, 18];

			expect(pack.title, `${pack.id} title`).not.toMatch(/Beginner|Intermediate|Advanced/);
			expect(pack.category, `${pack.id} category`).not.toMatch(/Beginner|Intermediate|Advanced/);
			expect(pack.questions.length, pack.id).toBeGreaterThanOrEqual(minQuestions);
			expect(pack.questions.length, pack.id).toBeLessThanOrEqual(maxQuestions);

			for (const question of pack.questions) {
				expect(question.difficulty, `${pack.id} difficulty`).toBe(expectedDifficulty);
				expect(question.hint, `${pack.id} hint`).toEqual(expect.any(String));

				if (tier === 'Advanced') {
					expect(question.explanation, `${pack.id} further study`).toContain('For further study');
				}
			}
		}
	});
});
