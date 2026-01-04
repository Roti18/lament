<script lang="ts">
	import { page } from '$app/state';
	import type { User, Playlist } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';

	const user: User = {
		id: page.params.id ?? 'u1',
		displayName: 'Aurora Listener',
		username: '@aurora',
		email: 'aurora@example.com',
		role: 'user',
		bio: 'Music is my sanctuary. Finding peace in melodies, rhythms, and the spaces between notes. Always seeking new sounds that move the soul.',
		stats: {
			playlistCount: 12,
			followersCount: 234,
			followingCount: 89
		}
	};

	const userPlaylists: Playlist[] = [
		{
			id: 'p1',
			title: 'Late Night Thoughts',
			description: 'For the quiet hours',
			trackCount: 18,
			tracks: []
		},
		{ id: 'p2', title: 'Morning Light', description: 'Gentle starts', trackCount: 12, tracks: [] },
		{
			id: 'p3',
			title: 'Focus Flow',
			description: 'Deep work companion',
			trackCount: 24,
			tracks: []
		}
	];

	const placeholderAvatar = (name: string) => {
		const initials = name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.substring(0, 2);
		return `data:image/svg+xml,${encodeURIComponent(`
			<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
				<rect width="160" height="160" fill="#242629"/>
				<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#9399a3" font-family="Inter, sans-serif" font-size="48" font-weight="500">${initials}</text>
			</svg>
		`)}`;
	};

	const playlistPlaceholder =
		'data:image/svg+xml,' +
		encodeURIComponent(`
		<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
			<rect width="100" height="100" fill="#1a1c1f"/>
			<path d="M30 35h40M30 50h40M30 65h25" stroke="#5c616b" stroke-width="2" stroke-linecap="round"/>
		</svg>
	`);

	function formatCount(count: number): string {
		if (count >= 1000) {
			return (count / 1000).toFixed(1) + 'k';
		}
		return count.toString();
	}
</script>

<svelte:head>
	<title>{user.displayName || user.username} | lament</title>
</svelte:head>

<div class="py-6">
	<header
		class="mb-12 flex flex-col items-center text-center md:flex-row md:items-start md:text-left"
	>
		<div
			class="mb-6 h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-surface-2 md:mr-8 md:mb-0 md:h-40 md:w-40"
		>
			<img
				src={user.avatarUrl || placeholderAvatar(user.displayName || user.username)}
				alt={user.displayName || user.username}
				class="h-full w-full object-cover"
			/>
		</div>

		<div class="flex-1">
			<h1 class="text-lg font-semibold text-text-primary md:text-3xl">{user.displayName}</h1>
			<p class="mt-1 text-text-muted">{user.username}</p>

			{#if user.bio}
				<p class="mt-4 max-w-lg text-text-secondary">{user.bio}</p>
			{/if}

			{#if user.stats}
				<div class="mt-6 flex justify-center gap-8 md:justify-start">
					{#if user.stats.playlistCount !== undefined}
						<div>
							<p class="text-lg font-medium text-text-primary">{user.stats.playlistCount}</p>
							<p class="text-sm text-text-muted">playlists</p>
						</div>
					{/if}
					{#if user.stats.followersCount !== undefined}
						<div>
							<p class="text-lg font-medium text-text-primary">
								{formatCount(user.stats.followersCount)}
							</p>
							<p class="text-sm text-text-muted">followers</p>
						</div>
					{/if}
					{#if user.stats.followingCount !== undefined}
						<div>
							<p class="text-lg font-medium text-text-primary">
								{formatCount(user.stats.followingCount)}
							</p>
							<p class="text-sm text-text-muted">following</p>
						</div>
					{/if}
				</div>
			{/if}

			<div class="mt-6 flex justify-center gap-3 md:justify-start">
				<Button variant="primary" class="rounded-full px-5 py-2 text-sm">Follow</Button>
				<Button variant="outline" class="rounded-full px-5 py-2 text-sm">Message</Button>
			</div>
		</div>
	</header>

	<section>
		<h2 class="mb-4 text-lg font-medium text-text-primary">Playlists</h2>

		{#if userPlaylists.length > 0}
			<div class="space-y-2">
				{#each userPlaylists as playlist}
					<a
						href="/playlist/{playlist.id}"
						class="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-surface-1"
					>
						<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-surface-2">
							<img
								src={playlist.coverThumb || playlistPlaceholder}
								alt={playlist.title}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="truncate font-medium text-text-primary group-hover:text-accent">
								{playlist.title}
							</h3>
							<p class="text-sm text-text-muted">{playlist.trackCount} tracks</p>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-text-muted">No public playlists</p>
		{/if}
	</section>
</div>
