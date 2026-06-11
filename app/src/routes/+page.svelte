<script lang="ts">
	import LandingPage from '$lib/components/LandingPage.svelte';
	import type { Pack } from '$lib/packs';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);
</script>

<LandingPage {packs} />
