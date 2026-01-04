<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import { Play, Search } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TrendingTracks from '$lib/components/explore/TrendingTracks.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';

	let { data } = $props();

	let sampleTracks = $derived(data.recentTracks);
	let sampleAlbums = $derived(data.albums);
	let sampleArtists = $derived(data.artists);
	let isSearchOpen = $state(false);

	function playAll() {
		player.setQueue(sampleTracks, 0);
	}
</script>

<svelte:head>
	<title>Home | lament</title>
</svelte:head>

<SearchModal bind:isOpen={isSearchOpen} />

<div class="space-y-10 py-6">
	<header class="flex items-center justify-between">
		<h1
			class="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent"
		>
			Home
		</h1>
		<button
			onclick={() => (isSearchOpen = true)}
			class="group flex items-center gap-3 rounded-full border border-white/10 bg-surface-1 py-2.5 pr-6 pl-4 transition-all hover:border-white/20 hover:bg-surface-2"
		>
			<Search class="h-4 w-4 text-text-secondary group-hover:text-white" />
			<span class="text-sm font-medium text-text-secondary group-hover:text-white"
				>What do you want to play?</span
			>
		</button>
	</header>

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

	<TrendingTracks />

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
