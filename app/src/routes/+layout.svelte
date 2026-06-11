<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { ratingsStore } from '$lib/stores/ratingsStore.js';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { onMount } from 'svelte';

	const MIN_ROUTE_LOADING_MS = 320;

	let { children } = $props();
	let desktopAppearanceOpen = $state(false);
	let mobileAppearanceOpen = $state(false);
	let activeAppearanceButton = $state<HTMLButtonElement | null>(null);
	let desktopAppearancePopover = $state<HTMLDivElement | null>(null);
	let mobileAppearancePopover = $state<HTMLDivElement | null>(null);
	let mobileMenu = $state<HTMLDetailsElement | null>(null);
	let mobileMenuOpen = $state(false);
	let routeLoading = $state(false);
	let routeLoadingStartedAt = 0;
	let routeLoadingTimer: ReturnType<typeof setTimeout> | undefined;

	const appearanceOpen = $derived(desktopAppearanceOpen || mobileAppearanceOpen);
	const routeKey = $derived(page.url.pathname);
	const routePath = $derived.by(() => {
		const pathname = page.url.pathname;

		if (base && pathname.startsWith(base)) {
			return pathname.slice(base.length) || '/';
		}

		return pathname || '/';
	});
	const breadcrumbs = $derived.by(() => {
		if (routePath === '/') {
			return [{ label: 'Quiz Lab' }];
		}

		if (routePath.startsWith('/packs')) {
			return [
				{ label: 'Quiz Lab', href: `${base}/` },
				{ label: 'Packs' }
			];
		}

		if (routePath.startsWith('/create')) {
			return [
				{ label: 'Quiz Lab', href: `${base}/` },
				{ label: 'Create' }
			];
		}

		if (routePath.startsWith('/play')) {
			return [
				{ label: 'Quiz Lab', href: `${base}/` },
				{ label: 'Packs', href: `${base}/packs` },
				{ label: 'Play' }
			];
		}

		return [
			{ label: 'Quiz Lab', href: `${base}/` },
			{ label: 'Page' }
		];
	});

	if (browser) {
		themeStore.init();
		ratingsStore.init();
	}

	function toggleAppearance(menu: 'desktop' | 'mobile', event: MouseEvent) {
		if (event.currentTarget instanceof HTMLButtonElement) {
			activeAppearanceButton = event.currentTarget;
		}

		if (menu === 'desktop') {
			desktopAppearanceOpen = !desktopAppearanceOpen;
			mobileAppearanceOpen = false;
			return;
		}

		mobileAppearanceOpen = !mobileAppearanceOpen;
		desktopAppearanceOpen = false;
	}

	function closeAppearance({ restoreFocus = false } = {}) {
		desktopAppearanceOpen = false;
		mobileAppearanceOpen = false;

		if (restoreFocus) {
			activeAppearanceButton?.focus();
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;

		if (mobileAppearanceOpen) {
			closeAppearance();
		}
	}

	function handleMobileMenuToggle(event: Event) {
		if (event.currentTarget instanceof HTMLDetailsElement && !event.currentTarget.open) {
			closeAppearance();
		}
	}

	function clearRouteLoadingTimer() {
		if (!routeLoadingTimer) return;

		clearTimeout(routeLoadingTimer);
		routeLoadingTimer = undefined;
	}

	function startRouteLoading() {
		clearRouteLoadingTimer();
		routeLoadingStartedAt = Date.now();
		routeLoading = true;
	}

	function finishRouteLoading() {
		if (!routeLoading) return;

		const elapsed = Date.now() - routeLoadingStartedAt;
		const remaining = MIN_ROUTE_LOADING_MS - elapsed;

		if (remaining <= 0) {
			routeLoading = false;
			return;
		}

		routeLoadingTimer = setTimeout(() => {
			routeLoading = false;
			routeLoadingTimer = undefined;
		}, remaining);
	}

	beforeNavigate((navigation) => {
		if (navigation.type === 'leave' || !navigation.to?.url) return;
		if (navigation.to.url.pathname === page.url.pathname) return;

		startRouteLoading();
	});

	afterNavigate(() => {
		finishRouteLoading();
	});

	onMount(() => {
		const stopThemePreferenceWatch = themeStore.watchSystemPreference();

		function handleDocumentPointerDown(event: PointerEvent) {
			if (!(event.target instanceof Node)) return;

			if (mobileMenuOpen && !mobileMenu?.contains(event.target)) {
				closeMobileMenu();
			}

			if (!appearanceOpen) return;

			if (
				event.target instanceof Element &&
				event.target.closest('[data-appearance-trigger]')
			) {
				return;
			}

			if (
				desktopAppearancePopover?.contains(event.target) ||
				mobileAppearancePopover?.contains(event.target)
			) {
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
			clearRouteLoadingTimer();
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
		<ol class="mobile-breadcrumb" aria-label="Breadcrumb">
			{#each breadcrumbs as breadcrumb, index (breadcrumb.label)}
				<li>
					{#if breadcrumb.href && index < breadcrumbs.length - 1}
						<a href={breadcrumb.href}>{breadcrumb.label}</a>
					{:else}
						<span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>
							{breadcrumb.label}
						</span>
					{/if}
				</li>
			{/each}
		</ol>
		<div class="nav-links desktop-links">
			<a href="{base}/packs">Packs</a>
			<a href="{base}/create">Create quiz</a>
			<div class="theme-menu">
				<button
					type="button"
					class="theme-trigger"
					data-appearance-trigger
					aria-controls="desktop-appearance-popover"
					aria-expanded={desktopAppearanceOpen}
					onclick={(event) => toggleAppearance('desktop', event)}
				>
					Appearance
				</button>
				<div
					bind:this={desktopAppearancePopover}
					id="desktop-appearance-popover"
					class="theme-popover"
					class:open={desktopAppearanceOpen}
					role="dialog"
					aria-hidden={!desktopAppearanceOpen}
					aria-label="Appearance options"
					inert={!desktopAppearanceOpen}
				>
					<ThemePicker compact />
				</div>
			</div>
			<a href="https://github.com/routeburn-alpha/product-itura" rel="noopener" target="_blank">
				GitHub
			</a>
		</div>
		<details
			bind:this={mobileMenu}
			bind:open={mobileMenuOpen}
			class="mobile-menu"
			ontoggle={handleMobileMenuToggle}
		>
			<summary>Menu</summary>
			<div class="mobile-menu-panel">
				<a href="{base}/packs" onclick={closeMobileMenu}>Packs</a>
				<a href="{base}/create" onclick={closeMobileMenu}>Create quiz</a>
				<div class="theme-menu">
					<button
						type="button"
						class="theme-trigger"
						data-appearance-trigger
						aria-controls="mobile-appearance-popover"
						aria-expanded={mobileAppearanceOpen}
						onclick={(event) => toggleAppearance('mobile', event)}
					>
						Appearance
					</button>
					<div
						bind:this={mobileAppearancePopover}
						id="mobile-appearance-popover"
						class="theme-popover"
						class:open={mobileAppearanceOpen}
						role="dialog"
						aria-hidden={!mobileAppearanceOpen}
						aria-label="Appearance options"
						inert={!mobileAppearanceOpen}
					>
						<ThemePicker compact />
					</div>
				</div>
				<a
					href="https://github.com/routeburn-alpha/product-itura"
					rel="noopener"
					target="_blank"
					onclick={closeMobileMenu}
				>
					GitHub
				</a>
			</div>
		</details>
	</nav>
</header>

{#if routeLoading}
	<div class="route-progress" role="status" aria-live="polite">
		<span class="visually-hidden">Loading next page</span>
		<span aria-hidden="true"></span>
	</div>
	<div class="route-skeleton" aria-hidden="true">
		<span></span>
		<span></span>
		<span></span>
	</div>
{/if}

<div class="route-shell" aria-busy={routeLoading}>
	{#key routeKey}
		<div>
			{@render children()}
		</div>
	{/key}
</div>

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

	@media (prefers-reduced-motion: reduce) {
		:global(:root) {
			--motion-duration-hover: 1ms !important;
			--motion-duration-focus: 1ms !important;
			--motion-duration-feedback: 1ms !important;
			--motion-duration-progress: 1ms !important;
			--motion-duration-entry: 1ms !important;
			--motion-duration-exit: 1ms !important;
			--motion-duration-loading: 1ms !important;
		}

		:global(html:focus-within) {
			scroll-behavior: auto;
		}
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
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
		background: var(--color-surface);
	}

	.route-shell {
		position: relative;
	}

	.route-progress {
		position: sticky;
		top: 0;
		z-index: 30;
		height: 0.2rem;
		overflow: hidden;
		background: var(--color-surface-subtle);
	}

	.route-progress span[aria-hidden='true'] {
		display: block;
		width: 42%;
		height: 100%;
		background: var(--color-green);
		animation: route-progress var(--motion-duration-loading) var(--motion-ease-emphasized) infinite;
	}

	.route-skeleton {
		display: grid;
		gap: var(--space-3);
		max-width: var(--content-default);
		margin: var(--space-4) auto 0;
		padding: 0 var(--space-8);
	}

	.route-skeleton span {
		display: block;
		height: 0.85rem;
		border-radius: var(--radius-pill);
		background:
			linear-gradient(
				90deg,
				var(--color-surface-subtle) 0%,
				var(--color-surface-muted) 48%,
				var(--color-surface-subtle) 100%
			);
		background-size: 220% 100%;
		animation: route-skeleton-shimmer var(--motion-duration-loading) var(--motion-ease-emphasized) infinite;
	}

	.route-skeleton span:nth-child(1) {
		width: min(22rem, 65%);
	}

	.route-skeleton span:nth-child(2) {
		width: min(34rem, 88%);
	}

	.route-skeleton span:nth-child(3) {
		width: min(18rem, 52%);
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

	.mobile-breadcrumb,
	.mobile-menu {
		display: none;
	}

	.nav-links a,
	.theme-trigger,
	.mobile-menu summary {
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
	.theme-trigger:hover,
	.mobile-menu[open] summary,
	.mobile-menu summary:hover {
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

	@keyframes route-progress {
		from {
			transform: translateX(-110%);
		}

		to {
			transform: translateX(240%);
		}
	}

	@keyframes route-skeleton-shimmer {
		from {
			background-position: 180% 0;
		}

		to {
			background-position: -80% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.route-progress span[aria-hidden='true'],
		.route-skeleton span {
			animation: none;
		}

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
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			gap: var(--space-3);
			padding: 0.75rem var(--space-4);
		}

		.brand,
		.desktop-links {
			display: none;
		}

		.mobile-breadcrumb {
			display: flex;
			align-items: center;
			min-width: 0;
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.mobile-breadcrumb li {
			display: flex;
			align-items: center;
			min-width: 0;
			color: var(--color-text-muted);
			font-size: var(--font-size-sm);
			font-weight: var(--font-weight-semibold);
		}

		.mobile-breadcrumb li + li::before {
			content: '/';
			flex: 0 0 auto;
			margin: 0 var(--space-2);
			color: var(--color-border-strong);
		}

		.mobile-breadcrumb a,
		.mobile-breadcrumb span {
			display: block;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.mobile-breadcrumb a {
			border-radius: var(--radius-sm);
			color: var(--color-text-muted);
			padding: 0.2rem 0;
			text-decoration: none;
		}

		.mobile-breadcrumb a:hover {
			color: var(--color-green);
		}

		.mobile-breadcrumb span[aria-current='page'] {
			color: var(--color-text);
		}

		.mobile-menu {
			position: relative;
			display: block;
		}

		.mobile-menu summary {
			list-style: none;
			min-height: 2.25rem;
			padding: 0.45rem 0.65rem;
		}

		.mobile-menu summary::-webkit-details-marker {
			display: none;
		}

		.mobile-menu-panel {
			position: absolute;
			top: calc(100% + 0.5rem);
			right: 0;
			z-index: 30;
			display: grid;
			min-width: 12.5rem;
			gap: var(--space-1);
			border: var(--border-width) solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			box-shadow: var(--shadow-card);
			padding: var(--space-2);
		}

		.mobile-menu:not([open]) .mobile-menu-panel {
			display: none;
		}

		.mobile-menu-panel a,
		.mobile-menu-panel .theme-trigger {
			width: 100%;
			box-sizing: border-box;
			border: 0;
			border-radius: var(--radius-md);
			background: transparent;
			color: var(--color-text-muted);
			display: block;
			font: inherit;
			font-size: var(--font-size-sm);
			font-weight: var(--font-weight-semibold);
			padding: 0.55rem 0.7rem;
			text-align: left;
			text-decoration: none;
		}

		.mobile-menu-panel a:hover,
		.mobile-menu-panel .theme-trigger[aria-expanded='true'],
		.mobile-menu-panel .theme-trigger:hover {
			background: var(--color-surface-muted);
			color: var(--color-green);
		}

		.theme-menu {
			position: static;
		}

		.mobile-menu .theme-popover {
			display: none;
			position: static;
			margin-top: var(--space-2);
			opacity: 1;
			pointer-events: auto;
			transform: none;
			transition: none;
			visibility: visible;
		}

		.mobile-menu .theme-popover.open {
			display: block;
		}

		.route-skeleton {
			padding: 0 var(--space-5);
		}
	}
</style>
