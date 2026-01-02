<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import { Home, Music, Disc, User, ListMusic, MessageSquarePlus, Search } from '@lucide/svelte';
	import { auth } from '$lib/stores/auth.svelte';

	$effect(() => {
		auth.init();
	});

	interface NavItem {
		href: string;
		label: string;
		icon: 'home' | 'music' | 'album' | 'playlist' | 'users' | 'request' | 'search';
	}

	const navItems = $derived([
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/tracks', label: 'Tracks', icon: 'music' },
		{ href: '/search', label: 'Search', icon: 'search' },
		{ href: '/albums', label: 'Albums', icon: 'album' },
		{
			href: auth.user ? '/profile' : '/login',
			label: auth.user ? 'Profile' : 'Login',
			icon: 'user'
		}
	]);

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		if (href === '/request') return page.url.pathname === '/request';
		return page.url.pathname.startsWith(href);
	}

	const iconMap: Record<string, any> = {
		home: Home,
		search: Search,
		music: Music,
		album: Disc,
		playlist: ListMusic,
		user: User,
		request: MessageSquarePlus
	};
</script>

<nav
	class="glass-nav transition-theme fixed top-0 left-0 z-40 hidden h-full w-20 flex-col items-center py-6 pb-24 lg:flex"
	aria-label="Main navigation"
>
	<a
		href="/"
		class="mb-10 flex h-12 w-12 items-center justify-center text-4xl font-bold tracking-tight text-accent italic transition-transform hover:scale-105"
		style="font-family: 'Cormorant Garamond', serif;"
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
					{#if item.icon === 'user' && auth.user && (auth.user.avatar_url || auth.user.avatarUrl)}
						<img
							src={auth.user.avatar_url || auth.user.avatarUrl}
							alt={auth.user.username}
							class="h-6 w-6 rounded-full object-cover"
						/>
					{:else}
						<Icon class="h-5 w-5" strokeWidth={isActive(item.href) ? 2 : 1.5} />
					{/if}

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

<nav
	class="glass-nav fixed right-0 bottom-0 left-0 z-40 flex h-mobile-nav-total items-center justify-around bg-surface-0 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl lg:hidden"
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

	<a
		href="/request"
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/request'
		)
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Request"
	>
		<MessageSquarePlus class="h-5 w-5" strokeWidth={isActive('/request') ? 2.5 : 2} />
	</a>

	<a
		href={auth.user ? '/profile' : '/login'}
		class="flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all {isActive(
			'/profile'
		) || isActive('/login')
			? 'text-accent'
			: 'text-text-secondary active:scale-95'}"
		aria-label="Account"
	>
		{#if auth.user && (auth.user.avatar_url || auth.user.avatarUrl)}
			<img
				src={auth.user.avatar_url || auth.user.avatarUrl}
				alt="Me"
				class="h-5 w-5 rounded-full object-cover"
			/>
		{:else}
			<User class="h-5 w-5" strokeWidth={isActive('/profile') || isActive('/login') ? 2.5 : 2} />
		{/if}
	</a>
</nav>
