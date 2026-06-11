<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';
	import { onMount } from 'svelte';

	type Props = {
		packs: Pack[];
	};

	let { packs }: Props = $props();
	let randomPack = $state<Pack | null>(null);

	const totalQuestions = $derived(
		packs.reduce((questionCount, pack) => questionCount + pack.questions.length, 0)
	);
	const presentedPack = $derived(randomPack ?? packs[0] ?? null);
	const previewPacks = $derived(packs.slice(0, 2));

	const recentPackStorageKey = 'quiz-lab-recent-random-packs';

	function getRecentLimit() {
		return Math.max(0, Math.min(3, packs.length - 1));
	}

	function readRecentPackIds() {
		try {
			const storedValue = localStorage.getItem(recentPackStorageKey);
			const parsedValue = storedValue ? JSON.parse(storedValue) : [];

			return Array.isArray(parsedValue)
				? parsedValue.filter((id): id is string => typeof id === 'string')
				: [];
		} catch {
			return [];
		}
	}

	function writeRecentPackId(packId: string) {
		const recentLimit = getRecentLimit();

		if (recentLimit === 0) {
			localStorage.removeItem(recentPackStorageKey);
			return;
		}

		const recentPackIds = readRecentPackIds();
		const nextRecentPackIds = [
			packId,
			...recentPackIds.filter((recentPackId) => recentPackId !== packId)
		].slice(0, recentLimit);

		localStorage.setItem(recentPackStorageKey, JSON.stringify(nextRecentPackIds));
	}

	function getRandomIndex(length: number) {
		if (length <= 1) {
			return 0;
		}

		const randomValues = new Uint32Array(1);

		if (globalThis.crypto) {
			globalThis.crypto.getRandomValues(randomValues);
			return randomValues[0] % length;
		}

		return Math.floor(Math.random() * length);
	}

	function selectRandomPack() {
		if (packs.length === 0) {
			randomPack = null;
			return;
		}

		const recentPackIds = readRecentPackIds();
		const freshPacks = packs.filter((pack) => !recentPackIds.includes(pack.id));
		const candidates = freshPacks.length > 0 ? freshPacks : packs;
		const selectedPack = candidates[getRandomIndex(candidates.length)] ?? null;

		randomPack = selectedPack;

		if (selectedPack) {
			writeRecentPackId(selectedPack.id);
		}
	}

	onMount(() => {
		selectRandomPack();
	});
</script>

<main class="landing-shell">
	<section class="hero" aria-labelledby="landing-title">
		<div class="hero-copy">
			<p class="eyebrow">Quiz Lab</p>
			<h1 id="landing-title" aria-label="Start sharper quizzes in Quiz Lab">
				Start
				<span class="animated-word" aria-hidden="true">
					<span>sharper</span>
					<span>faster</span>
					<span>focused</span>
				</span>
				quizzes.
			</h1>
			<p class="subtitle">
				Pick a published pack, test your recall, or build a new quiz draft from the same focused workspace.
			</p>
			<div class="hero-actions" aria-label="Landing page actions">
				<a class="primary-action" href="{base}/packs">Browse packs</a>
				<a class="secondary-action" href="{base}/create">Create quiz</a>
			</div>
		</div>

		<div class="feature-stack">
			<div class="random-panel" aria-live="polite">
				<p class="panel-label">Random quiz</p>
				{#if presentedPack}
					<h2>{presentedPack.title}</h2>
					<p>{presentedPack.description}</p>
					<div class="quiz-meta">
						<span>{presentedPack.category}</span>
						<span>{presentedPack.questions.length} questions</span>
					</div>
					<div class="random-actions">
						<a class="primary-action" href="{base}/play/{presentedPack.id}">Start random quiz</a>
						<button type="button" class="secondary-action" onclick={selectRandomPack}>Shuffle</button>
					</div>
				{:else}
					<p>No published quizzes are available yet.</p>
				{/if}
			</div>

			<div class="summary-panel" aria-label="Published quiz library summary">
				<p class="panel-label">Library ready</p>
				<div class="summary-grid">
					<div>
						<strong>{packs.length}</strong>
						<span>packs</span>
					</div>
					<div>
						<strong>{totalQuestions}</strong>
						<span>questions</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	{#if previewPacks.length > 0}
		<section class="pack-strip" aria-labelledby="landing-packs-title">
			<div class="strip-heading">
				<div>
					<p class="eyebrow">Published packs</p>
					<h2 id="landing-packs-title">Choose a focused round</h2>
				</div>
				<a href="{base}/packs">View all packs</a>
			</div>

			<div class="preview-grid">
				{#each previewPacks as pack (pack.id)}
					<a class="preview-pack" href="{base}/play/{pack.id}">
						<span>{pack.category}</span>
						<strong>{pack.title}</strong>
						<small>{pack.questions.length} questions</small>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</main>

<style>
	.landing-shell {
		max-width: var(--content-default);
		margin: 0 auto;
		padding: var(--space-8);
		color: var(--color-text);
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(260px, 0.42fr);
		gap: var(--space-6);
		align-items: stretch;
		min-height: min(440px, calc(100vh - 9rem));
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		border-bottom: var(--border-width) solid var(--color-border);
		padding: var(--space-10) 0;
	}

	.eyebrow,
	.panel-label {
		margin: 0 0 var(--space-3);
		color: var(--color-green);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h1,
	p {
		margin-top: 0;
	}

	h1 {
		max-width: 10ch;
		margin-bottom: var(--space-4);
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		line-height: 1;
		letter-spacing: 0;
	}

	.animated-word {
		position: relative;
		display: block;
		overflow: hidden;
		height: 1.04em;
		color: var(--color-green);
	}

	.animated-word span {
		display: block;
		height: 1.04em;
		animation: word-shift 6s infinite;
	}

	.subtitle {
		max-width: 58ch;
		margin-bottom: var(--space-6);
		color: var(--color-text-muted);
		font-size: var(--font-size-lg);
		line-height: 1.55;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.primary-action,
	.secondary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.5rem;
		border-radius: var(--radius-md);
		padding: 0.7rem 1rem;
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		transition:
			background var(--motion-fast) var(--motion-ease),
			border-color var(--motion-fast) var(--motion-ease),
			color var(--motion-fast) var(--motion-ease),
			box-shadow var(--motion-fast) var(--motion-ease);
	}

	.primary-action {
		border: var(--border-width) solid var(--color-green);
		background: var(--color-green);
		color: var(--color-text-inverse);
	}

	.primary-action:hover {
		border-color: var(--color-green-hover);
		background: var(--color-green-hover);
	}

	.secondary-action {
		border: var(--border-width) solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.secondary-action:hover {
		border-color: var(--color-green-border);
		background: var(--color-surface-muted);
		color: var(--color-green);
	}

	.feature-stack {
		align-self: center;
		display: grid;
		gap: var(--space-4);
	}

	.random-panel,
	.summary-panel {
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		box-shadow: var(--shadow-card);
		padding: var(--space-6);
	}

	.random-panel h2 {
		margin: 0 0 var(--space-3);
		font-size: var(--font-size-xl);
		line-height: 1.2;
		letter-spacing: 0;
	}

	.random-panel p:not(.panel-label) {
		margin-bottom: var(--space-4);
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.quiz-meta,
	.random-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.quiz-meta {
		margin-bottom: var(--space-5);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.quiz-meta span {
		border: var(--border-width) solid var(--color-green-border);
		border-radius: var(--radius-pill);
		background: var(--color-green-soft);
		padding: 0.25rem 0.55rem;
		color: var(--color-green);
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.summary-grid div {
		border-top: var(--border-width) solid var(--color-border);
		padding-top: var(--space-4);
	}

	.summary-grid strong,
	.summary-grid span {
		display: block;
	}

	.summary-grid strong {
		font-size: var(--font-size-2xl);
		line-height: 1;
	}

	.summary-grid span {
		margin-top: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.pack-strip {
		border-top: var(--border-width) solid var(--color-border);
		margin-top: var(--space-6);
		padding-top: var(--space-6);
	}

	.strip-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.strip-heading h2 {
		margin: 0;
		font-size: var(--font-size-lg);
		line-height: 1.2;
		letter-spacing: 0;
	}

	.strip-heading a {
		border-radius: var(--radius-md);
		color: var(--color-green);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		padding: 0.45rem 0.55rem;
		text-decoration: none;
	}

	.strip-heading a:hover {
		background: var(--color-surface-muted);
		color: var(--color-green-hover);
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-4);
	}

	.preview-pack {
		display: grid;
		gap: var(--space-2);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: var(--space-4);
		color: inherit;
		text-decoration: none;
		transition:
			background var(--motion-fast) var(--motion-ease),
			border-color var(--motion-fast) var(--motion-ease),
			box-shadow var(--motion-fast) var(--motion-ease);
	}

	.preview-pack:hover {
		border-color: var(--color-green-border);
		background: var(--color-surface-muted);
		box-shadow: var(--shadow-hover);
	}

	.preview-pack span,
	.preview-pack small {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
	}

	.preview-pack strong {
		font-size: var(--font-size-md);
		line-height: 1.25;
	}

	@keyframes word-shift {
		0%,
		28% {
			transform: translateY(0);
		}
		34%,
		62% {
			transform: translateY(-1.04em);
		}
		68%,
		96% {
			transform: translateY(-2.08em);
		}
		100% {
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.animated-word span {
			animation: none;
		}

		.animated-word span:not(:first-child) {
			display: none;
		}
	}

	@media (max-width: 760px) {
		.landing-shell {
			padding: var(--space-5);
		}

		.hero {
			grid-template-columns: 1fr;
			min-height: auto;
		}

		.hero-copy {
			padding: var(--space-8) 0;
		}

		h1 {
			font-size: var(--font-size-2xl);
		}

		.subtitle {
			font-size: var(--font-size-md);
		}

		.strip-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-2);
		}

		.preview-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
