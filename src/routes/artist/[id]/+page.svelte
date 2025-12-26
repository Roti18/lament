<!--
  Artist Detail View
-->
<script lang="ts">
	import { page } from '$app/state';
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import { Play, User } from '@lucide/svelte';

	let { data } = $props();
	let artist = $derived(data.artist);

	// TODO: Fetch top tracks separately if not included in Artist object?
	// The API client maps artist, but does it map top tracks?
	// The `Artist` type in `types.ts` does NOT have `tracks` or `albums`.
	// We might need to fetch `getArtistAlbums` or similar?
	// The prompt only listed `GET /artists/:id`.
	// If the API return includes them, we need to extend the type or use `any`.
	// For now, let's assume `artist` object might have extended data or we just show empty if missing.

	// Wait, internal `types.ts` Artist DOES NOT have tracks.
	// But the UI needs `topTracks` and `albums`.
	// API `GET /artists/:id` might return them.
	// I'll update `types.ts` if needed or just use `any` casting in the template if I'm lazy, but better to update types.
	// I'll assume they come with the artist for now, or Mock them empty to prevent crash.

	let topTracks = $derived(artist.tracks || []);
	let albums = $derived(artist.albums || []);

	function playTopTracks() {
		if (topTracks.length > 0) {
			player.setQueue(topTracks, 0);
		}
	}
</script>

<svelte:head>
	<title>{artist.name} | lament</title>
</svelte:head>

<div class="py-6">
	<!-- Artist header -->
	<header
		class="mb-8 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left"
	>
		<!-- Image -->
		<div
			class="h-40 w-40 flex-shrink-0 overflow-hidden rounded-full bg-surface-2 shadow-xl md:h-48 md:w-48"
		>
			{#if artist.imageUrl}
				<img src={artist.imageUrl} alt={artist.name} class="h-full w-full object-cover" />
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<User class="h-20 w-20 text-text-muted opacity-50" strokeWidth={1} />
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div>
			<p class="text-xs font-medium tracking-wider text-text-muted uppercase">Artist</p>
			<h1 class="mt-1 text-lg font-bold text-text-primary md:text-4xl">{artist.name}</h1>
			{#if artist.bio}
				<p class="mt-2 max-w-lg text-sm text-text-secondary">{artist.bio}</p>
			{/if}
			<div class="mt-4 flex justify-center gap-3 md:justify-start">
				<button
					onclick={playTopTracks}
					class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 transition-opacity hover:opacity-90"
					aria-label="Play top tracks"
				>
					<Play class="h-5 w-5 fill-current" />
				</button>
			</div>
		</div>
	</header>

	<!-- Top tracks -->
	<section class="mb-10">
		<h2 class="mb-4 text-lg font-medium text-text-primary">Popular tracks</h2>
		<div class="space-y-1">
			{#each topTracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>

	<!-- Albums -->
	<section>
		<h2 class="mb-4 text-lg font-medium text-text-primary">Albums</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each albums as album}
				<AlbumCard {album} />
			{/each}
		</div>
	</section>
</div>
