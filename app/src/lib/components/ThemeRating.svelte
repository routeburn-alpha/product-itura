<script lang="ts">
	import { ratingsStore } from '$lib/stores/ratingsStore.js';

	let { themeId }: { themeId: string } = $props();

	const stars = [1, 2, 3, 4, 5];
	const rating = $derived($ratingsStore[themeId] ?? 0);

	function setRating(star: number) {
		ratingsStore.setRating(themeId, star);
	}

	function focusStar(event: KeyboardEvent, star: number) {
		const starButtons = Array.from(
			(event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button') ?? []
		);
		starButtons[star - 1]?.focus();
	}

	function handleKeydown(event: KeyboardEvent, star: number) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			const nextStar = star >= 5 ? 1 : star + 1;
			setRating(nextStar);
			focusStar(event, nextStar);
		}

		if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			const nextStar = star <= 1 ? 5 : star - 1;
			setRating(nextStar);
			focusStar(event, nextStar);
		}
	}
</script>

<div class="theme-rating">
	<span class="rating-label">Rate</span>
	<div class="star-group" role="radiogroup" aria-label="Theme rating">
		{#each stars as star}
			<button
				type="button"
				class="star"
				class:filled={rating >= star}
				role="radio"
				aria-checked={rating === star}
				aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
				tabindex={rating === star || (rating === 0 && star === 1) ? 0 : -1}
				onclick={() => setRating(star)}
				onkeydown={(event) => handleKeydown(event, star)}
			>
				<span aria-hidden="true">&#9733;</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.theme-rating {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding-top: var(--space-2);
	}

	.rating-label {
		color: var(--color-text-muted);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
	}

	.star-group {
		display: flex;
		align-items: center;
		gap: 0.1rem;
	}

	.star {
		display: inline-grid;
		width: 1.75rem;
		height: 1.75rem;
		place-items: center;
		border: var(--border-width) solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		font: inherit;
		font-size: var(--font-size-md);
		line-height: 1;
		transition:
			background var(--motion-fast) var(--motion-ease),
			border-color var(--motion-fast) var(--motion-ease),
			color var(--motion-fast) var(--motion-ease);
	}

	.star:hover,
	.star:focus-visible {
		border-color: var(--color-green-border);
		background: var(--color-green-soft);
		color: var(--color-green-hover);
	}

	.star.filled {
		color: var(--color-green);
	}
</style>
