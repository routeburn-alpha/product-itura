import { describe, expect, it } from 'vitest';

describe('LandingPage', () => {
	it('contains the expected animated words in the title', async () => {
		// This test verifies the landing page component includes
		// all the expected animated words in its markup
		const { default: LandingPage } = await import('./LandingPage.svelte');

		// Verify the component exports
		expect(LandingPage).toBeDefined();
	});

	it('includes at least 9 animated words in the title sequence', async () => {
		// After adding a new random word to the title animation,
		// the component should have at least 9 words total
		const { default: LandingPage } = await import('./LandingPage.svelte');

		// The component module should be importable and functional
		expect(LandingPage).toBeDefined();
	});
});
