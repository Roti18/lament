<!--
  Playlists Listing View
-->
<script lang="ts">
	import type { Playlist } from '$lib/types';

	let { data } = $props();
	let playlists = $derived(data.playlists);

	// Placeholder artwork
	const placeholderArt =
		'data:image/svg+xml,' +
		encodeURIComponent(`
		<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
			<rect width="200" height="200" fill="#1a1c1f"/>
			<path d="M60 60h80v80H60z" fill="none" stroke="#5c616b" stroke-width="2"/>
			<path d="M80 80h40v40H80z" fill="#5c616b"/>
		</svg>
	`);
</script>

<svelte:head>
	<title>Playlists | lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-6">
		<h1 class="text-lg font-semibold text-text-primary">Playlists</h1>
		<p class="text-sm text-text-secondary">{playlists.length} playlists</p>
	</header>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
		{#each playlists as playlist}
			<a href="/playlist/{playlist.id}" class="group block">
				<div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface-2">
					<img
						src={playlist.coverThumb || placeholderArt}
						alt={playlist.title}
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</div>
				<h3 class="truncate text-sm font-medium text-text-primary group-hover:text-accent">
					{playlist.title}
				</h3>
				<p class="text-xs text-text-secondary">{playlist.trackCount} tracks</p>
			</a>
		{/each}
	</div>
</div>
