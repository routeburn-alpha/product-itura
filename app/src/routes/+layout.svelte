<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<nav class="top-nav" aria-label="Primary">
		<a class="brand" href="{base}/">Quiz Lab</a>
		<div class="nav-links">
			<a href="{base}/">Packs</a>
			<a href="{base}/create">Create quiz</a>
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
		--motion-fast: 120ms;
		--motion-medium: 180ms;
		--motion-ease: ease;
	}

	:global(body) {
		margin: 0;
		background: var(--color-page);
		color: var(--color-text);
		font-family: var(--font-sans);
	}

	:global(a:focus-visible),
	:global(button:focus-visible),
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

	.nav-links a {
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		padding: 0.55rem 0.7rem;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.nav-links a:hover {
		background: var(--color-surface-muted);
		color: var(--color-green);
	}

	@media (max-width: 560px) {
		.top-nav {
			align-items: flex-start;
			flex-direction: column;
			padding: 0.85rem var(--space-5);
		}

		.nav-links {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			width: 100%;
		}

		.nav-links a {
			text-align: center;
		}
	}
</style>
