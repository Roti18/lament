<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import type { Track } from '$lib/types';
	import { Play, Pause, Music, ListPlus } from '@lucide/svelte';
	import AddToPlaylistModal from '$lib/components/ui/AddToPlaylistModal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		track?: Track;
		index?: number;
		showIndex?: boolean;
		loading?: boolean;
	}

	let { track, index = 0, showIndex = false, loading = false }: Props = $props();

	let isCurrentTrack = $derived(player.currentTrack?.id === track?.id);
	let isPlaying = $derived(isCurrentTrack && player.isPlaying);
	let modalOpen = $state(false);

	function handleClick() {
		if (!track) return;
		if (isCurrentTrack) {
			player.toggle();
		} else {
			player.play(track);
		}
	}

	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function openAddToPlaylist(e: Event) {
		e.stopPropagation();
		modalOpen = true;
	}
</script>

{#if loading || !track}
	<div class="flex w-full items-center gap-3 px-3 py-2">
		{#if showIndex}
			<div class="w-6 skeleton h-4 rounded"></div>
		{/if}
		<div class="h-10 w-10 skeleton rounded flex-shrink-0"></div>
		<div class="min-w-0 flex-1 space-y-2">
			<div class="skeleton h-4 w-1/3 rounded"></div>
			<div class="skeleton h-3 w-1/4 rounded"></div>
		</div>
		<div class="skeleton h-3 w-10 rounded flex-shrink-0"></div>
	</div>
{:else}
	<div
		role="button"
		tabindex="0"
		onclick={handleClick}
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
		class="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-1 {isCurrentTrack
			? 'bg-surface-1'
			: ''}"
	>
		{#if showIndex}
			<div class="w-6 flex-shrink-0 text-center text-sm text-text-muted tabular-nums">
				{#if isPlaying}
					<span class="inline-flex gap-0.5">
						<span class="h-3 w-0.5 animate-pulse rounded-full bg-accent"></span>
						<span class="h-3 w-0.5 animate-pulse rounded-full bg-accent" style="animation-delay: 0.2s"
						></span>
						<span class="h-3 w-0.5 animate-pulse rounded-full bg-accent" style="animation-delay: 0.4s"
						></span>
					</span>
				{:else}
					{index + 1}
				{/if}
			</div>
		{/if}

		<div class="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface-2">
			{#if track.coverThumb}
				<img
					src={track.coverThumb}
					alt={track.album || track.title}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-surface-3 text-text-muted">
					<Music class="h-5 w-5" strokeWidth={1.5} />
				</div>
			{/if}
			<div
				class="absolute inset-0 flex items-center justify-center bg-surface-0/60 opacity-0 transition-opacity group-hover:opacity-100"
			>
				{#if isPlaying}
					<Pause class="h-4 w-4 text-text-primary" fill="currentColor" />
				{:else}
					<Play class="h-4 w-4 text-text-primary" fill="currentColor" />
				{/if}
			</div>
		</div>

		<div class="min-w-0 flex-1">
			<p
				class="truncate text-left text-sm font-medium {isCurrentTrack
					? 'text-accent'
					: 'text-text-primary'}"
			>
				{track.title}
			</p>
			<p class="truncate text-left text-xs text-text-secondary">
				{#if track.artists && track.artists.length > 0}
					{#each track.artists as artist, i}
						<span>{artist.name}</span>
						{#if i < track.artists.length - 1}
							<span class="text-text-muted">, </span>
						{/if}
					{/each}
				{:else}
					<span class="text-text-muted">Unknown Artist</span>
				{/if}
			</p>
		</div>

		<span class="flex-shrink-0 text-xs text-text-muted tabular-nums"
			>{formatDuration(track.duration)}</span
		>

	</div>

	<AddToPlaylistModal bind:open={modalOpen} {track} />
{/if}
