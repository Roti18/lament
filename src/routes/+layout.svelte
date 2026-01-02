<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Player from '$lib/components/Player.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { navigating } from '$app/stores';
	import { LogOut, User as UserIcon, Settings } from 'lucide-svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	// Check if we are on login or register (including any subpaths)
	let isAuthPage = $derived(
		page.url.pathname === '/login' ||
			page.url.pathname === '/register' ||
			page.url.pathname.includes('/login/') ||
			page.url.pathname.includes('/register/')
	);
</script>

{#if $navigating}
	<LoadingSpinner fullScreen={true} size="lg" />
{/if}

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Lament</title>
	<meta name="description" content="A calm, personal music listening experience" />
	<meta name="theme-color" content="#0d0e10" />
</svelte:head>

{#if !isAuthPage}
	<Navigation />
{/if}

<main
	class="min-h-screen {isAuthPage
		? ''
		: 'pt-4 pb-[calc(var(--spacing-player-height-mobile)+var(--mobile-nav-bottom-total))] lg:pb-24 lg:pl-24'}"
>
	<div class="mx-auto {isAuthPage ? '' : 'max-w-6xl px-4 lg:px-6'}">
		{@render children()}
	</div>
</main>

{#if !isAuthPage}
	<Player />
	<SearchModal />
{/if}
