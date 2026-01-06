<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import MediaHeader from '$lib/components/MediaHeader.svelte';

	let { data } = $props();
	let album = $derived(data.album);

	const totalDuration = $derived(album.tracks?.reduce((acc, t) => acc + t.duration, 0) || 0);

	function formatTotalDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		return `${mins} min`;
	}

	function playAll() {
		player.setQueue(album.tracks, 0);
	}

	function shufflePlay() {
		const shuffled = [...album.tracks].sort(() => Math.random() - 0.5);
		player.setQueue(shuffled, 0);
	}
</script>

<svelte:head>
	<title>{album.title} | Lament</title>
</svelte:head>

<div class="py-4 md:py-6">
	<MediaHeader
		type="album"
		title={album.title}
		coverUrl={album.coverUrl}
		onPlay={playAll}
		onShuffle={shufflePlay}
	>
		{#snippet subtitle()}
			<p class="text-xs text-text-secondary md:text-base">
				<a href="/artist/{album.artistId}" class="hover:text-accent hover:underline">
					{album.artist}
				</a>
			</p>
		{/snippet}
		{#snippet meta()}
			{album.releaseYear} · {album.tracks.length} tracks · {formatTotalDuration(totalDuration)}
		{/snippet}
	</MediaHeader>

	<section>
		<div class="space-y-1">
			{#each album.tracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>
</div>
