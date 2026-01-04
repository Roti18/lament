<script lang="ts">
	import { page } from '$app/state';
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import { Play, User } from '@lucide/svelte';

	let { data } = $props();
	let artist = $derived(data.artist);

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
	<header
		class="mb-8 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left"
	>
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

		<div>
			<p class="text-xs font-medium tracking-wider text-text-muted uppercase">Artist</p>
			<h1 class="mt-1 text-3xl font-bold text-text-primary md:text-5xl">{artist.name}</h1>
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

	<section class="mb-10">
		<h2 class="mb-4 text-xl font-bold text-text-primary">Popular Tracks</h2>
		<div class="space-y-1">
			{#each topTracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-xl font-bold text-text-primary">Albums</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each albums as album}
				<AlbumCard {album} />
			{/each}
		</div>
	</section>
</div>
