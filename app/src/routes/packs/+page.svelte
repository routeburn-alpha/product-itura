<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);
</script>

<div class="container">
	<header class="page-header">
		<div>
			<p class="eyebrow">Quiz Lab</p>
			<h1>Pick a pack</h1>
			<p class="subtitle">Choose a published trivia pack and jump straight into a round.</p>
		</div>
	</header>

	<section class="pack-section" aria-labelledby="packs-title">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Published packs</p>
				<h2 id="packs-title">Play existing quizzes</h2>
			</div>
			<span>{packs.length} packs</span>
		</div>

		<div class="pack-grid">
			{#each packs as pack (pack.id)}
				<a class="pack-card" href="{base}/play/{pack.id}">
					<div class="pack-header">
						<h3>{pack.title}</h3>
						<span class="category">{pack.category}</span>
					</div>
					<p class="description">{pack.description}</p>
					<div class="meta">
						<span>{pack.questions.length} questions</span>
						<span class="play">Play</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.container {
		max-width: var(--content-default);
		margin: 0 auto;
		padding: var(--space-8);
		color: var(--color-text);
	}

	.page-header,
	.section-heading,
	.pack-header,
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		color: var(--color-green);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.45rem;
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		line-height: 1;
		letter-spacing: 0;
	}

	h2 {
		margin-bottom: 0;
		font-size: var(--font-size-lg);
		line-height: 1.2;
		letter-spacing: 0;
	}

	h3 {
		margin: 0;
		font-size: var(--font-size-md);
		line-height: 1.3;
		letter-spacing: 0;
	}

	.subtitle {
		max-width: 54ch;
		margin-bottom: 0;
		color: var(--color-text-muted);
		line-height: 1.55;
	}

	.pack-section {
		border-top: var(--border-width) solid var(--color-border);
		padding-top: 1.5rem;
	}

	.section-heading {
		margin-bottom: 1rem;
	}

	.section-heading > span {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-4);
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: 1rem;
		color: inherit;
		text-decoration: none;
		transition:
			border-color var(--motion-duration-hover) var(--motion-ease-standard),
			box-shadow var(--motion-duration-hover) var(--motion-ease-standard);
	}

	.pack-card:hover {
		border-color: var(--color-green);
		box-shadow: var(--shadow-hover);
	}

	.category {
		flex-shrink: 0;
		border-radius: var(--radius-sm);
		background: var(--color-green-soft);
		color: var(--color-green);
		padding: 0.2rem 0.45rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.description {
		flex: 1;
		margin-bottom: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	.meta {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.play {
		color: var(--color-green);
		font-weight: var(--font-weight-bold);
		white-space: nowrap;
	}

	.pack-card:hover .play {
		color: var(--color-green);
	}

	@media (prefers-reduced-motion: no-preference) {
		.pack-card {
			transition:
				border-color var(--motion-duration-hover) var(--motion-ease-standard),
				box-shadow var(--motion-duration-hover) var(--motion-ease-standard),
				transform var(--motion-duration-hover) var(--motion-ease-standard);
		}

		.pack-card:hover {
			transform: translateY(-2px);
		}
	}

	@media (max-width: 680px) {
		.container {
			padding: var(--space-5);
		}

		.page-header,
		.section-heading,
		.pack-header,
		.meta {
			align-items: flex-start;
			flex-direction: column;
		}

		h1 {
			font-size: var(--font-size-2xl);
		}
	}
</style>
