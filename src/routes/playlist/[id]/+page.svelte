<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import MediaHeader from '$lib/components/MediaHeader.svelte';

	let { data } = $props();
	let playlist = $derived(data.playlist);

	const totalDuration = $derived(playlist.tracks?.reduce((acc, t) => acc + t.duration, 0) || 0);

	function formatTotalDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		return `${mins} min`;
	}

	function playAll() {
		player.setQueue(playlist.tracks, 0);
	}

	function shufflePlay() {
		const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
		player.setQueue(shuffled, 0);
	}
</script>

<svelte:head>
	<title>{playlist.title} | Lament</title>
</svelte:head>

<div class="py-4 md:py-6">
	<MediaHeader
		type="playlist"
		title={playlist.title}
		coverUrl={playlist.coverUrl}
		onPlay={playAll}
		onShuffle={shufflePlay}
	>
		{#snippet meta()}
			{playlist.trackCount} tracks · {formatTotalDuration(totalDuration)}
		{/snippet}
		{#snippet subtitle()}
			{#if playlist.description}
				<p class="line-clamp-2 text-xs text-text-secondary md:max-w-lg md:text-sm">
					{playlist.description}
				</p>
			{/if}
		{/snippet}
	</MediaHeader>

	<section>
		<div class="space-y-1">
			{#each playlist.tracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>
</div>
