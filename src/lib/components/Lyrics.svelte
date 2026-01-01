<script lang="ts">
	import { browser } from '$app/environment';
	import { player } from '$lib/stores/player.svelte';
	import { fade, fly } from 'svelte/transition';
	import { ChevronDown, Loader2, Music2, AlertCircle } from 'lucide-svelte';
	import type { LyricLine } from '$lib/types';

	let { onClose }: { onClose: () => void } = $props();

	// State
	let lines: LyricLine[] = $state([]);
	let isSynced = $state(true);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let activeLineIndex = $state(-1);
	let userScrolled = $state(false);
	let scrollTimeout: any;
	let containerRef: HTMLDivElement;

	async function fetchLyrics(trackId: string) {
		if (!browser) return;
		loading = true;
		error = null;
		lines = [];
		activeLineIndex = -1;

		try {
			// Fetch specific variant via BFF (always original)
			const res = await fetch(`/api/lyrics/${trackId}?variant=original`);
			if (!res.ok) throw new Error('Failed to fetch lyrics');

			const data = await res.json();

			// New structure: { variant, lines, synced }
			if (data && Array.isArray(data.lines)) {
				lines = data.lines;
				isSynced = !!data.synced;

				if (lines.length === 0) {
					error = 'Lyrics not available';
				}
			} else {
				lines = [];
				error = 'Lyrics not available';
			}
		} catch (e) {
			console.error(e);
			error = 'Lyrics not available';
			lines = [];
		} finally {
			loading = false;
		}
	}

	// Watch for track changes
	let lastFetchedId = $state<string | null>(null);

	$effect(() => {
		const trackId = player.currentTrack?.id;
		if (browser && trackId && trackId !== lastFetchedId) {
			lastFetchedId = trackId;
			fetchLyrics(trackId);
		}
	});

	// Sync Logic (Core)
	$effect(() => {
		if (!lines.length || !isSynced || !player.currentTrack || loading) return;

		const timeMs = player.currentTime * 1000;

		// Find the active line: highest index where t <= timeMs
		let newIndex = -1;
		// Optimization: iterate from current index or use binary search?
		// Given typically < 100 lines, linear search from start or end is fine.
		// Prompt example used reverse loop.
		for (let i = lines.length - 1; i >= 0; i--) {
			if (lines[i].t <= timeMs) {
				newIndex = i;
				break;
			}
		}

		if (newIndex !== activeLineIndex) {
			activeLineIndex = newIndex;
			if (!userScrolled && newIndex !== -1) {
				scrollToActiveLine(newIndex);
			}
		}
	});

	function scrollToActiveLine(index: number) {
		if (!containerRef) return;
		const lineEl = document.getElementById(`lyric-line-${index}`);
		if (lineEl) {
			lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function handleScroll() {
		if (!loading && lines.length > 0) {
			userScrolled = true;
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				userScrolled = false;
				// Optional: snap back to active line after timeout?
				// Spotify doesn't always strictly snap back, but often does.
				if (activeLineIndex !== -1) {
					scrollToActiveLine(activeLineIndex);
				}
			}, 3000);
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 transition-all duration-300"
	transition:fly={{ y: '100%', duration: 300 }}
>
	<!-- Background: Simplified for performance -->
	{#if player.currentTrack?.coverUrl}
		<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-20">
			<img src={player.currentTrack.coverUrl} alt="" class="h-full w-full object-cover blur-2xl" />
		</div>
		<div
			class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-zinc-950/80 to-zinc-950"
		></div>
	{/if}

	<!-- Header -->
	<div class="z-10 flex shrink-0 items-center justify-between px-6 py-6 md:px-12">
		<div class="flex items-center gap-4">
			<button
				onclick={onClose}
				class="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
				aria-label="Close Lyrics"
			>
				<ChevronDown class="h-6 w-6" />
			</button>
			<div class="flex flex-col overflow-hidden">
				<span class="text-xs font-bold tracking-wider text-white/60 uppercase">Now Playing</span>
				<span class="max-w-[200px] truncate font-semibold text-white"
					>{player.currentTrack?.title}</span
				>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div
		class="no-scrollbar relative flex-1 overflow-y-auto px-6 py-10 text-center md:px-12"
		onscroll={handleScroll}
		bind:this={containerRef}
	>
		{#if loading}
			<div class="flex h-full items-center justify-center">
				<Loader2 class="h-10 w-10 animate-spin text-accent" />
			</div>
		{:else if error || lines.length === 0}
			<div class="flex h-full flex-col items-center justify-center gap-4 text-white/50">
				<Music2 class="h-16 w-16 opacity-20" />
				<p class="text-xl font-medium">{error || 'Lyrics not available for this track'}</p>
			</div>
		{:else}
			<div class="flex flex-col gap-4 pb-[50vh] md:gap-6">
				{#each lines as line, i}
					<button
						id="lyric-line-{i}"
						class="block w-full origin-center py-2 text-xl font-bold transition-all duration-500 outline-none md:text-3xl
                        {isSynced
							? i === activeLineIndex
								? 'scale-105 text-white opacity-100 blur-none'
								: 'text-white/60 opacity-40 blur-[1px] hover:opacity-80 hover:blur-none'
							: 'text-white opacity-90 hover:opacity-100'}
                        "
						onclick={() => {
							// Sync audio to this line
							if (isSynced && line.t !== undefined && line.t !== -1) {
								player.seek(line.t / 1000);
								activeLineIndex = i;
								scrollToActiveLine(i);
							}
						}}
						tabindex="0"
					>
						{#if line.tokens && line.tokens.length > 0}
							{#each line.tokens as token}
								{#if token.highlight}
									<span class="text-green-400 dark:text-green-500">{token.text}</span>
								{:else}
									{token.text}
								{/if}
							{/each}
						{:else}
							{line.text}
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
