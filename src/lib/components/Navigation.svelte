<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import {
		Home,
		Music,
		Disc,
		User,
		ListMusic,
		Users,
		MessageSquarePlus,
		Search
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

	interface NavItem {
		href: string;
		label: string;
		icon: 'home' | 'music' | 'album' | 'artist' | 'playlist' | 'users' | 'request' | 'search';
	}

	const navItems: NavItem[] = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/tracks', label: 'Tracks', icon: 'music' },
		{ href: '/search', label: 'Search', icon: 'search' },
		{ href: '/albums', label: 'Albums', icon: 'album' },
		{ href: '/artists', label: 'Artists', icon: 'artist' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		if (href === '/request') return page.url.pathname === '/request';
		return page.url.pathname.startsWith(href);
	}

	const iconMap = {
		home: Home,
		search: Search,
		music: Music,
		album: Disc,
		artist: User,
		playlist: ListMusic,
		users: Users,
		request: MessageSquarePlus
	};
</script>

<!-- Desktop Icon-Only Sidebar -->
<nav
	class="glass-nav transition-theme fixed top-0 left-0 z-40 hidden h-full w-20 flex-col items-center py-6 pb-24 lg:flex"
	aria-label="Main navigation"
>
	<a
		href="/"
		class="mb-10 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-bold text-black transition-transform hover:scale-105"
	>
		L
	</a>

	<ul class="flex w-full flex-col items-center gap-4">
		{#each navItems as item}
			{@const Icon = iconMap[item.icon]}
			<li>
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
			</li>
		{/each}
	</ul>

	<div class="mt-auto flex flex-col items-center gap-4">
		<a
			href="/request"
			class="group flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-all hover:bg-surface-1 hover:text-text-primary {isActive(
				'/request'
			)
				? 'text-accent'
				: ''}"
			aria-label="Request a song"
		>
			<MessageSquarePlus class="h-5 w-5" strokeWidth={1.5} />
		</a>
		<ThemeToggle />
	</div>
</nav>

<!-- Mobile Bottom Navigation -->
<nav
	class="glass-nav fixed right-0 bottom-0 left-0 z-40 flex h-[var(--mobile-nav-bottom-total)] items-center justify-around border-t border-surface-2/50 bg-surface-0/80 px-2 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md lg:hidden"
	aria-label="Mobile navigation"
>
	<!-- Home -->
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

	<!-- Tracks -->
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

	<!-- Search -->
	<a
		href="/search"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/search'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Search"
	>
		<Search class="h-5 w-5" strokeWidth={isActive('/search') ? 2.5 : 2} />
	</a>

	<!-- Albums -->
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

	<!-- Artists -->
	<a
		href="/artists"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/artists'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Artists"
	>
		<User class="h-5 w-5" strokeWidth={isActive('/artists') ? 2.5 : 2} />
	</a>
</nav>
