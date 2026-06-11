<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';

	type Props = {
		packs: Pack[];
	};

	let { packs }: Props = $props();

	const totalQuestions = $derived(
		packs.reduce((questionCount, pack) => questionCount + pack.questions.length, 0)
	);
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
				<a class="primary-action" href="{base}/">Browse packs</a>
				<a class="secondary-action" href="{base}/create">Create quiz</a>
			</div>
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
	</section>
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
		min-height: min(560px, calc(100vh - 5rem));
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

	.summary-panel {
		align-self: center;
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		box-shadow: var(--shadow-card);
		padding: var(--space-6);
	}

	.summary-grid {
		display: grid;
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
		font-size: var(--font-size-3xl);
		line-height: 1;
	}

	.summary-grid span {
		margin-top: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
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
	}
</style>
