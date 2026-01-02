<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import { Play } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	let sampleTracks = $derived(data.recentTracks);
	let sampleAlbums = $derived(data.albums);
	let sampleArtists = $derived(data.artists);

	function playAll() {
		player.setQueue(sampleTracks, 0);
	}
</script>

<svelte:head>
	<title>Home | lament</title>
</svelte:head>

<div class="space-y-10 py-6">
	<section>
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-medium text-text-primary">Recently played</h2>
			<Button
				variant="secondary"
				size="icon"
				class="rounded-full border-none bg-accent/10 text-accent hover:bg-accent/20"
				onclick={playAll}
				aria-label="Play all"
			>
				<Play class="h-4 w-4 fill-current" />
			</Button>
		</div>
		<div class="space-y-1">
			{#each sampleTracks.slice(0, 5) as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-lg font-medium text-text-primary">Albums for you</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each sampleAlbums as album}
				<AlbumCard {album} />
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-4 text-lg font-medium text-text-primary">Artists</h2>
		<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
			{#each sampleArtists as artist}
				<ArtistCard {artist} />
			{/each}
		</div>
	</section>
</div>
