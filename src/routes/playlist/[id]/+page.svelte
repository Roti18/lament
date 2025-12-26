<script lang="ts">
	import { page } from '$app/state';
	import { player } from '$lib/stores/player.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import type { Playlist, Track } from '$lib/types';
	import { Play, Shuffle, Disc } from '@lucide/svelte';

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
	<title>{playlist.title} | lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-8 flex flex-col gap-6 md:flex-row md:items-end">
		<div class="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-56">
			<div
				class="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-2 shadow-xl"
			>
				{#if playlist.coverUrl}
					<img src={playlist.coverUrl} alt={playlist.title} class="h-full w-full object-cover" />
				{:else}
					<Disc class="h-24 w-24 text-text-muted opacity-50" strokeWidth={1} />
				{/if}
			</div>
		</div>

		<div class="text-center md:text-left">
			<p class="text-xs font-medium tracking-wider text-text-muted uppercase">Playlist</p>
			<h1 class="mt-1 text-lg font-bold text-text-primary md:text-4xl">{playlist.title}</h1>
			{#if playlist.description}
				<p class="mt-2 max-w-lg text-sm text-text-secondary">{playlist.description}</p>
			{/if}
			<p class="mt-2 text-xs text-text-muted">
				{playlist.trackCount} tracks · {formatTotalDuration(totalDuration)}
			</p>
			<div class="mt-4 flex justify-center gap-3 md:justify-start">
				<button
					onclick={playAll}
					class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 transition-opacity hover:opacity-90"
					aria-label="Play all"
				>
					<Play class="h-5 w-5 fill-current" />
				</button>
				<button
					onclick={shufflePlay}
					class="flex h-10 w-10 items-center justify-center rounded-full border border-surface-3 text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
					aria-label="Shuffle play"
				>
					<Shuffle class="h-5 w-5" />
				</button>
			</div>
		</div>
	</header>

	<section>
		<div class="space-y-1">
			{#each playlist.tracks as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	</section>
</div>
