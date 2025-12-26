<!--
  Album Detail View
-->
<script lang="ts">
	import { page } from '$app/state';
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import type { Album, Track } from '$lib/types';
	import { Play, Disc } from '@lucide/svelte';

	let { data } = $props();
	// Need to handle potential null if error not thrown (though load throws)
	let album = $derived(data.album);

	const totalDuration = $derived(album.tracks?.reduce((acc, t) => acc + t.duration, 0) || 0);

	function formatTotalDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		return `${mins} min`;
	}

	function playAll() {
		player.setQueue(album.tracks, 0);
	}
</script>

<svelte:head>
	<title>{album.title} | lament</title>
</svelte:head>

<div class="py-6">
	<!-- Album header -->
	<header class="mb-8 flex flex-col gap-6 md:flex-row md:items-end">
		<!-- Artwork -->
		<div class="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-56">
			<div
				class="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-2 shadow-xl"
			>
				{#if album.coverUrl}
					<img src={album.coverUrl} alt={album.title} class="h-full w-full object-cover" />
				{:else}
					<Disc class="h-24 w-24 text-text-muted opacity-50" strokeWidth={1} />
				{/if}
			</div>
		</div>

		<!-- Info -->
		<div class="text-center md:text-left">
			<p class="text-xs font-medium tracking-wider text-text-muted uppercase">Album</p>
			<h1 class="mt-1 text-lg font-bold text-text-primary md:text-4xl">{album.title}</h1>
			<p class="mt-2 text-text-secondary">
				<a href="/artist/{album.artistId}" class="hover:text-accent hover:underline"
					>{album.artist}</a
				>
				<span class="text-text-muted">
					· {album.releaseYear} · {album.tracks.length} tracks · {formatTotalDuration(
						totalDuration
					)}</span
				>
			</p>
			<div class="mt-4 flex justify-center gap-3 md:justify-start">
				<button
					onclick={playAll}
					class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 transition-opacity hover:opacity-90"
					aria-label="Play all"
				>
					<Play class="h-5 w-5 fill-current" />
				</button>
			</div>
		</div>
	</header>

	<!-- Track list -->
	<section>
		<div class="space-y-1">
			{#each album.tracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>
</div>
