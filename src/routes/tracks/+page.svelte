<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import { Play, Shuffle } from '@lucide/svelte';

	let { data } = $props();
	let tracks = $derived(data.tracks);

	function playAll() {
		player.setQueue(tracks, 0);
	}

	function shufflePlay() {
		const shuffled = [...tracks].sort(() => Math.random() - 0.5);
		player.setQueue(shuffled, 0);
	}
</script>

<svelte:head>
	<title>Tracks | lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-6 flex items-end justify-between">
		<div>
			<h1 class="text-lg font-semibold text-text-primary">Tracks</h1>
			<p class="text-sm text-text-secondary">{tracks.length} tracks</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={shufflePlay}
				class="flex h-10 w-10 items-center justify-center rounded-full border border-surface-3 text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
				aria-label="Shuffle play"
			>
				<Shuffle class="h-5 w-5" />
			</button>
			<button
				onclick={playAll}
				class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 transition-opacity hover:opacity-90"
				aria-label="Play all"
			>
				<Play class="h-5 w-5 fill-current" />
			</button>
		</div>
	</header>

	<div class="space-y-1">
		{#each tracks as track, i}
			<TrackCard {track} index={i} showIndex />
		{/each}
	</div>
</div>
