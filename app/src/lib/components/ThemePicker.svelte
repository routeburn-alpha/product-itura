<script lang="ts">
	import ThemeRating from '$lib/components/ThemeRating.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { availableThemes } from '$lib/themes/index.js';

	let { compact = false }: { compact?: boolean } = $props();

	const currentTheme = $derived(
		availableThemes.find((theme) => theme.id === $themeStore) ?? availableThemes[0]
	);

	function getPreviewStyle(theme: (typeof availableThemes)[number]) {
		const colors = theme.previewColors;

		return [
			`--preview-page: ${colors.page}`,
			`--preview-surface: ${colors.surface}`,
			`--preview-text: ${colors.text}`,
			`--preview-muted: ${colors.muted}`,
			`--preview-accent: ${colors.accent}`,
			`--preview-border: ${colors.border}`
		].join('; ');
	}
</script>

<section class="theme-picker" class:compact aria-labelledby="theme-picker-title">
	<div class="theme-picker-heading">
		<div>
			<p class="eyebrow">Appearance</p>
			<h2 id="theme-picker-title">Theme</h2>
		</div>
		<span>{currentTheme.name}</span>
	</div>

	<div class="theme-grid">
		{#each availableThemes as theme (theme.id)}
			<article class="theme-option" class:selected={$themeStore === theme.id}>
				<button
					type="button"
					class="theme-select"
					aria-pressed={$themeStore === theme.id}
					onclick={() => themeStore.setTheme(theme.id)}
				>
					<span class="theme-preview" style={getPreviewStyle(theme)} aria-hidden="true">
						<span class="preview-shell">
							<span class="preview-header"></span>
							<span class="preview-line strong"></span>
							<span class="preview-line"></span>
							<span class="preview-accent"></span>
						</span>
					</span>
					<span class="theme-copy">
						<span class="theme-name">{theme.name}</span>
						<span class="theme-description">{theme.description}</span>
					</span>
				</button>
				<ThemeRating themeId={theme.id} />
			</article>
		{/each}
	</div>
</section>

<style>
	.theme-picker {
		box-sizing: border-box;
		display: grid;
		gap: var(--space-4);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: var(--space-5);
		box-shadow: var(--shadow-card);
		color: var(--color-text);
	}

	.theme-picker.compact {
		width: min(28rem, calc(100vw - 2rem));
		padding: var(--space-4);
		box-shadow: var(--shadow-hover);
	}

	.theme-picker-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.theme-picker-heading span {
		border: var(--border-width) solid var(--color-green-border);
		border-radius: var(--radius-pill);
		background: var(--color-green-soft);
		color: var(--color-green);
		padding: 0.25rem 0.55rem;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		white-space: nowrap;
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		color: var(--color-green);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-lg);
		line-height: 1.2;
		letter-spacing: 0;
	}

	.theme-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-3);
	}

	.compact .theme-grid {
		grid-template-columns: 1fr;
	}

	.theme-option {
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: var(--space-3);
		transition:
			background var(--motion-duration-hover) var(--motion-ease-standard),
			border-color var(--motion-duration-hover) var(--motion-ease-standard),
			box-shadow var(--motion-duration-focus) var(--motion-ease-standard);
	}

	.theme-option.selected {
		border-color: var(--color-green);
		background: var(--color-green-soft);
	}

	.theme-select {
		display: grid;
		width: 100%;
		grid-template-columns: 4rem minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font: inherit;
		padding: 0;
		text-align: left;
	}

	.theme-preview {
		display: grid;
		width: 4rem;
		aspect-ratio: 1;
		place-items: center;
		border: var(--border-width) solid var(--preview-border);
		border-radius: var(--radius-md);
		background: var(--preview-page);
	}

	.preview-shell {
		display: grid;
		width: 2.8rem;
		gap: 0.25rem;
		border: var(--border-width) solid var(--preview-border);
		border-radius: var(--radius-sm);
		background: var(--preview-surface);
		padding: 0.35rem;
	}

	.preview-header,
	.preview-line,
	.preview-accent {
		display: block;
		height: 0.35rem;
		border-radius: var(--radius-pill);
	}

	.preview-header {
		width: 1.3rem;
		background: var(--preview-accent);
	}

	.preview-line {
		background: var(--preview-muted);
	}

	.preview-line.strong {
		background: var(--preview-text);
	}

	.preview-accent {
		width: 1.8rem;
		background: var(--preview-accent);
	}

	.theme-copy {
		display: grid;
		min-width: 0;
		gap: 0.2rem;
	}

	.theme-name {
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		line-height: 1.2;
	}

	.theme-description {
		color: var(--color-text-muted);
		font-size: var(--font-size-xs);
		line-height: 1.35;
	}

	@media (max-width: 560px) {
		.theme-picker-heading {
			align-items: flex-start;
			flex-direction: column;
			gap: var(--space-2);
		}
	}
</style>
