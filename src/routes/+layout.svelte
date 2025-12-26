<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Player from '$lib/components/Player.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Lament</title>
	<meta name="description" content="A calm, personal music listening experience" />
	<meta name="theme-color" content="#0d0e10" />
</svelte:head>

<Navigation />

<main class="pt-4 lg:pb-24 lg:pl-24 min-h-screen pb-[calc(var(--spacing-player-height-mobile)+var(--mobile-nav-bottom-total))]">
	<div class="max-w-6xl px-4 lg:px-6 mx-auto">
		{@render children()}
	</div>
</main>

<Player />

<SearchModal />
