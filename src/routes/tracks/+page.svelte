<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import VirtualTrackList from '$lib/components/VirtualTrackList.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Play, Shuffle } from '@lucide/svelte';

	let { data } = $props();
	let tracks = $derived(data.tracks);

	const useVirtualization = $derived(tracks.length > 50);

	function playAll() {
		player.setQueue(tracks, 0);
	}

	function shufflePlay() {
		const shuffled = [...tracks].sort(() => Math.random() - 0.5);
		player.setQueue(shuffled, 0);
	}
</script>

<svelte:head>
	<title>Tracks | Lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-6 flex items-end justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-primary">Tracks</h1>
			<p class="mt-1 text-sm text-text-secondary">{tracks.length} tracks</p>
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="icon"
				class="rounded-full border-surface-3 text-text-secondary hover:border-text-secondary hover:text-text-primary"
				onclick={shufflePlay}
				aria-label="Shuffle"
			>
				<Shuffle class="h-5 w-5" />
			</Button>
			<Button
				variant="primary"
				size="icon"
				class="rounded-full"
				onclick={playAll}
				aria-label="Play all"
			>
				<Play class="h-5 w-5 fill-current" />
			</Button>
		</div>
	</header>

	{#if useVirtualization}
		<VirtualTrackList {tracks} />
	{:else}
		<div class="space-y-1">
			{#each tracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	{/if}
</div>
