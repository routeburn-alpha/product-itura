<script lang="ts">
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { ratingsStore } from '$lib/stores/ratingsStore.js';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { onMount } from 'svelte';

	let { children } = $props();
	let appearanceOpen = $state(false);
	let appearanceButton = $state<HTMLButtonElement | null>(null);
	let appearancePopover = $state<HTMLDivElement | null>(null);

	if (browser) {
		themeStore.init();
		ratingsStore.init();
	}

	function toggleAppearance() {
		appearanceOpen = !appearanceOpen;
	}

	function closeAppearance({ restoreFocus = false } = {}) {
		appearanceOpen = false;

		if (restoreFocus) {
			appearanceButton?.focus();
		}
	}

	onMount(() => {
		const stopThemePreferenceWatch = themeStore.watchSystemPreference();

		function handleDocumentPointerDown(event: PointerEvent) {
			if (!appearanceOpen || !(event.target instanceof Node)) return;

			if (appearanceButton?.contains(event.target) || appearancePopover?.contains(event.target)) {
				return;
			}

			closeAppearance();
		}

		function handleDocumentKeydown(event: KeyboardEvent) {
			if (!appearanceOpen || event.key !== 'Escape') return;

			event.preventDefault();
			closeAppearance({ restoreFocus: true });
		}

		document.addEventListener('pointerdown', handleDocumentPointerDown);
		document.addEventListener('keydown', handleDocumentKeydown);

		return () => {
			stopThemePreferenceWatch();
			document.removeEventListener('pointerdown', handleDocumentPointerDown);
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<nav class="top-nav" aria-label="Primary">
		<a class="brand" href="{base}/">Quiz Lab</a>
		<div class="nav-links">
			<a href="{base}/packs">Packs</a>
			<a href="{base}/create">Create quiz</a>
			<div class="theme-menu">
				<button
					bind:this={appearanceButton}
					type="button"
					class="theme-trigger"
					aria-controls="appearance-popover"
					aria-expanded={appearanceOpen}
					onclick={toggleAppearance}
				>
					Appearance
				</button>
				<div
					bind:this={appearancePopover}
					id="appearance-popover"
					class="theme-popover"
					class:open={appearanceOpen}
					role="dialog"
					aria-hidden={!appearanceOpen}
					aria-label="Appearance options"
					inert={!appearanceOpen}
				>
					<ThemePicker compact />
				</div>
			</div>
			<a href="https://github.com/routeburn-alpha/product-itura" rel="noopener" target="_blank">
				GitHub
			</a>
		</div>
	</nav>
</header>

{@render children()}

<style>
	:global(:root) {
		--color-page: #f7faf8;
		--color-surface: #ffffff;
		--color-surface-muted: #eef7f2;
		--color-surface-subtle: #f2f5f3;
		--color-text: #111111;
		--color-text-muted: #5f6b62;
		--color-text-inverse: #ffffff;
		--color-border: #d9e2dc;
		--color-border-strong: #9fb3a8;
		--color-green: #0f766e;
		--color-green-hover: #0b5d55;
		--color-green-soft: #e6f6f0;
		--color-green-border: #a8d8ce;
		--color-critical-bg: #f2f5f3;
		--color-critical-border: #111111;
		--color-critical-text: #111111;
		--color-focus-ring: rgba(15, 118, 110, 0.24);
		--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--font-size-xs: 0.75rem;
		--font-size-sm: 0.875rem;
		--font-size-md: 1rem;
		--font-size-lg: 1.25rem;
		--font-size-xl: 1.5rem;
		--font-size-2xl: 2rem;
		--font-size-3xl: 3rem;
		--font-size-score: 4rem;
		--font-weight-regular: 400;
		--font-weight-medium: 650;
		--font-weight-semibold: 750;
		--font-weight-bold: 850;
		--space-1: 0.25rem;
		--space-2: 0.5rem;
		--space-3: 0.75rem;
		--space-4: 1rem;
		--space-5: 1.25rem;
		--space-6: 1.5rem;
		--space-8: 2rem;
		--space-10: 2.5rem;
		--content-wide: 1180px;
		--content-default: 1080px;
		--content-readable: 760px;
		--content-narrow: 720px;
		--radius-sm: 6px;
		--radius-md: 8px;
		--radius-pill: 999px;
		--border-width: 1px;
		--border-width-strong: 2px;
		--shadow-card: 0 12px 30px rgba(17, 17, 17, 0.06);
		--shadow-hover: 0 10px 24px rgba(17, 17, 17, 0.08);
		--shadow-focus: 0 0 0 3px var(--color-focus-ring);
		--motion-fast: 150ms;
		--motion-medium: 250ms;
		--motion-slow: 400ms;
		--motion-ease-out: ease-out;
		--motion-ease-in-out: ease-in-out;
		--motion-ease: var(--motion-ease-out);
		--motion-duration-hover: var(--motion-fast);
		--motion-duration-focus: var(--motion-fast);
		--motion-duration-feedback: var(--motion-medium);
		--motion-duration-progress: var(--motion-medium);
		--motion-duration-entry: var(--motion-medium);
		--motion-duration-exit: var(--motion-fast);
		--motion-duration-loading: var(--motion-slow);
		--motion-ease-standard: var(--motion-ease-out);
		--motion-ease-emphasized: var(--motion-ease-in-out);
	}

	:global(body) {
		margin: 0;
		background: var(--color-page);
		color: var(--color-text);
		font-family: var(--font-sans);
	}

	:global(a),
	:global(button),
	:global(summary),
	:global(input),
	:global(textarea),
	:global(select),
	:global([role='textbox']) {
		transition:
			background var(--motion-duration-hover) var(--motion-ease-standard),
			border-color var(--motion-duration-hover) var(--motion-ease-standard),
			color var(--motion-duration-hover) var(--motion-ease-standard),
			box-shadow var(--motion-duration-focus) var(--motion-ease-standard);
	}

	:global(a:focus-visible),
	:global(button:focus-visible),
	:global(summary:focus-visible),
	:global(input:focus-visible),
	:global(textarea:focus-visible),
	:global(select:focus-visible),
	:global([role='textbox']:focus-visible) {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.site-header {
		border-bottom: var(--border-width) solid var(--color-border);
		background: var(--color-surface);
	}

	.top-nav {
		max-width: var(--content-default);
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: 0.8rem var(--space-8);
	}

	.brand {
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-md);
		color: var(--color-text);
		text-decoration: none;
		letter-spacing: 0;
	}

	.nav-links {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.35rem;
	}

	.nav-links a,
	.theme-trigger {
		border: 0;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		display: block;
		font: inherit;
		padding: 0.55rem 0.7rem;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.nav-links a:hover,
	.theme-trigger[aria-expanded='true'],
	.theme-trigger:hover {
		background: var(--color-surface-muted);
		color: var(--color-green);
	}

	.theme-menu {
		position: relative;
	}

	.theme-popover {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		top: calc(100% + 0.55rem);
		right: 0;
		transform: translateY(-0.35rem) scale(0.98);
		transform-origin: top right;
		transition:
			opacity var(--motion-duration-exit) var(--motion-ease-standard),
			transform var(--motion-duration-exit) var(--motion-ease-standard),
			visibility 0s linear var(--motion-duration-exit);
		visibility: hidden;
		will-change: opacity, transform;
		z-index: 20;
	}

	.theme-popover.open {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0) scale(1);
		transition:
			opacity var(--motion-duration-entry) var(--motion-ease-standard),
			transform var(--motion-duration-entry) var(--motion-ease-standard),
			visibility 0s;
		visibility: visible;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-popover,
		.theme-popover.open {
			transform: none;
			transition:
				opacity var(--motion-duration-exit) var(--motion-ease-standard),
				visibility 0s linear var(--motion-duration-exit);
		}
	}

	@media (max-width: 560px) {
		.top-nav {
			align-items: flex-start;
			flex-direction: column;
			padding: 0.85rem var(--space-5);
		}

		.nav-links {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			width: 100%;
		}

		.nav-links a,
		.theme-trigger {
			text-align: center;
		}

		.theme-menu {
			position: static;
		}

		.theme-popover {
			position: fixed;
			top: 7rem;
			right: var(--space-4);
			left: var(--space-4);
			transform-origin: top center;
		}
	}
</style>
