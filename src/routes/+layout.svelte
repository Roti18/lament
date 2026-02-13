<script lang="ts">
	import './layout.css';
	import Player from '$lib/components/Player.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { navigating } from '$app/stores';
	import { page } from '$app/state';
	import { player } from '$lib/stores/player.svelte';

	let { children } = $props();


	// Update page title when track is playing
	$effect(() => {
		if (player.currentTrack && player.isPlaying) {
			document.title = `${player.currentTrack.title} | Lament`;
		} else if (player.currentTrack) {
			document.title = `${player.currentTrack.title} (Paused) | Lament`;
		} else {
			document.title = 'Lament';
		}
	});

	let isAuthPage = false;

	let isErrorPage = $derived(page.status >= 400);
</script>

{#if $navigating}
	<div class="loading-bar"></div>
{/if}

<svelte:head>
	<title>Lament</title>
	<meta name="description" content="A calm, personal music listening experience" />
	<meta name="theme-color" content="#0d0e10" />
</svelte:head>

{#if !isAuthPage && !isErrorPage}
	<Navigation />
{/if}

<main
	class="min-h-screen {isAuthPage || isErrorPage
		? ''
		: `pt-4 ${player.currentTrack ? 'pb-[calc(var(--spacing-player-height-mobile)+var(--mobile-nav-bottom-total))] lg:pb-32' : 'pb-[calc(var(--mobile-nav-bottom-total)+1rem)] lg:pb-8'} lg:pl-24`}"
>
	<div class="mx-auto {isErrorPage ? '' : 'max-w-6xl px-4 lg:px-6'}">
		{@render children()}
	</div>
</main>

{#if !isAuthPage && !isErrorPage}
	<Player />
	<SearchModal />
{/if}
