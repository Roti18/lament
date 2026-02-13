<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import {
		Home,
		Music,
		Disc,
		ListMusic,
		MessageSquarePlus,
		Search,
		Mic2,
		MoreVertical,
		Sun,
		Moon
	} from '@lucide/svelte';
	import Logo from './ui/Logo.svelte';
	import SearchModal from './SearchModal.svelte';
	import Button from './ui/Button.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { slide, fade } from 'svelte/transition';

	let isSearchOpen = $state(false);
	let isMenuOpen = $state(false);

	interface NavItem {
		href: string;
		label: string;
		icon: 'home' | 'music' | 'album' | 'artists' | 'playlist' | 'user' | 'request' | 'search';
	}

	const navItems = $derived([
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/tracks', label: 'Tracks', icon: 'music' },
		{ href: '/albums', label: 'Albums', icon: 'album' },
		{ href: '/request', label: 'Requests', icon: 'request' }
	]);

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		if (href === '/request') return page.url.pathname === '/request' || page.url.pathname === '/request/new';
		return page.url.pathname.startsWith(href);
	}

	const iconMap: Record<string, any> = {
		home: Home,
		music: Music,
		album: Disc,
		artists: Mic2,
		playlist: ListMusic,
		request: MessageSquarePlus,
		search: Search
	};
</script>

<SearchModal bind:isOpen={isSearchOpen} />

{#if isMenuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/5"
		onclick={() => (isMenuOpen = false)}
		transition:fade={{ duration: 150 }}
	></div>
{/if}

<nav
	class="glass-nav fixed top-0 left-0 z-[60] hidden h-[100dvh] w-20 flex-col border-r border-white/5 bg-surface-0 lg:flex"
	aria-label="Main navigation"
>
	<!-- Top: Logo -->
	<div class="flex h-20 items-center justify-center border-b border-white/5 flex-none">
		<a href="/" class="transition-transform hover:scale-105" aria-label="Home">
			<Logo size="40px" class="text-accent" />
		</a>
	</div>

	<!-- Center: Nav Items -->
	<div class="flex-1 flex flex-col items-center justify-center gap-6 py-4">
		{#each navItems as item}
			{@const Icon = iconMap[item.icon]}
			<a
				href={item.href}
				class="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all {isActive(
					item.href
				)
					? 'bg-surface-2 text-accent'
					: 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'}"
				aria-label={item.label}
			>
				<Icon class="h-5 w-5" strokeWidth={isActive(item.href) ? 2 : 1.5} />
				<span
					class="absolute left-14 hidden rounded-md bg-surface-3 px-2 py-1 text-xs font-medium whitespace-nowrap text-text-primary opacity-0 shadow-sm transition-opacity group-hover:block group-hover:opacity-100"
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>

	<!-- Bottom: Actions (Extra padding to avoid player overlap) -->
	<div class="flex-none flex flex-col items-center gap-4 p-4 border-t border-white/5 pb-28">
		<button
			onclick={() => (isSearchOpen = true)}
			class="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-all hover:bg-surface-1 hover:text-text-primary"
			aria-label="Search"
		>
			<Search class="h-5 w-5" />
		</button>
		<ThemeToggle />
	</div>
</nav>

<nav
	class="glass-nav fixed right-0 bottom-0 left-0 z-[60] flex h-mobile-nav-total items-center justify-around bg-surface-0 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl lg:hidden"
	aria-label="Mobile navigation"
>
	<a
		href="/"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Home"
	>
		<Home class="h-5 w-5" strokeWidth={isActive('/') ? 2.5 : 2} />
	</a>

	<a
		href="/tracks"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/tracks'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Tracks"
	>
		<Music class="h-5 w-5" strokeWidth={isActive('/tracks') ? 2.5 : 2} />
	</a>

	<button
		onclick={() => (isSearchOpen = true)}
		class="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface-0 shadow-lg transition-all active:scale-95"
		aria-label="Search"
	>
		<Search class="h-5 w-5" strokeWidth={2.5} />
	</button>

	<a
		href="/albums"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/albums'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Albums"
	>
		<Disc class="h-5 w-5" strokeWidth={isActive('/albums') ? 2.5 : 2} />
	</a>

	<div class="relative flex h-10 w-10 items-center justify-center">
		{#if isMenuOpen}
			<div
				transition:fade={{ duration: 150 }}
				class="absolute right-0 bottom-full mb-6 flex items-center gap-4 rounded-full border border-white/10 bg-surface-1/95 px-5 py-3.5 shadow-2xl backdrop-blur-3xl whitespace-nowrap"
			>
				<a
					href="/request"
					onclick={() => (isMenuOpen = false)}
					class="flex items-center gap-2 text-text-secondary transition-all hover:text-text-primary active:scale-95"
				>
					<MessageSquarePlus class="h-4 w-4 text-accent" />
					<span class="text-[10px] font-bold uppercase tracking-widest text-white/40">Request</span>
				</a>

				<div class="h-3 w-px bg-white/10"></div>

				<button
					onclick={() => theme.toggle()}
					class="flex items-center gap-2 text-text-secondary transition-all hover:text-text-primary active:scale-95"
				>
					<div class="text-accent">
						{#if theme.current === 'dark'}
							<Sun class="h-4 w-4" />
						{:else}
							<Moon class="h-4 w-4" />
						{/if}
					</div>
					<span class="text-[10px] font-bold uppercase tracking-widest text-white/40">Theme</span>
				</button>
			</div>
		{/if}

		<button
			onclick={() => (isMenuOpen = !isMenuOpen)}
			class="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-all active:scale-95 {isMenuOpen
				? 'text-accent'
				: ''}"
			aria-label="More"
		>
			<MoreVertical class="h-5 w-5" />
		</button>
	</div>
</nav>
