<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Player from '$lib/components/Player.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import { navigating } from '$app/state';

	let { children } = $props();
</script>

{#if navigating}
	<div class="loading-bar"></div>
{/if}

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Lament</title>
	<meta name="description" content="A calm, personal music listening experience" />
	<meta name="theme-color" content="#0d0e10" />
</svelte:head>

<Navigation />

<main
	class="min-h-screen pt-4 pb-[calc(var(--spacing-player-height-mobile)+var(--mobile-nav-bottom-total))] lg:pb-24 lg:pl-24"
>
	<div class="mx-auto max-w-6xl px-4 lg:px-6">
		{@render children()}
	</div>
</main>

<Player />

<SearchModal />
