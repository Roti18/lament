<script lang="ts">
	import { browser } from '$app/environment';
	import { player } from '$lib/stores/player.svelte';
	import { fade, fly } from 'svelte/transition';
	import { ChevronDown, Loader2, Music2 } from '@lucide/svelte';
	import type { LyricLine } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';

	let { onClose }: { onClose: () => void } = $props();

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
			const res = await fetch(`/api/lyrics/${trackId}?variant=original`);
			if (!res.ok) throw new Error('Failed to fetch lyrics');
			const data = await res.json();
			if (data && Array.isArray(data.lines)) {
				lines = data.lines;
				isSynced = !!data.synced;
				if (lines.length === 0) error = 'Lyrics not available';
			} else {
				lines = [];
				error = 'Lyrics not available';
			}
		} catch (e) {
			error = 'Lyrics not available';
			lines = [];
		} finally {
			loading = false;
		}
	}

	let lastFetchedId = $state<string | null>(null);

	$effect(() => {
		const trackId = player.currentTrack?.id;
		if (browser && trackId && trackId !== lastFetchedId) {
			lastFetchedId = trackId;
			fetchLyrics(trackId);
		}
	});

	$effect(() => {
		if (!lines.length || !isSynced || !player.currentTrack || loading) return;
		const timeMs = player.currentTime * 1000;
		let newIndex = -1;
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
				if (activeLineIndex !== -1) scrollToActiveLine(activeLineIndex);
			}, 3000);
		}
	}
</script>

<div
	class="fixed inset-0 z-[100] flex flex-col bg-black transition-all duration-300"
	transition:fly={{ y: '100%', duration: 400 }}
>
	{#if player.currentTrack?.coverUrl}
		<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
			<img src={player.currentTrack.coverUrl} alt="" class="h-full w-full object-cover blur-[120px] scale-110" />
		</div>
		<div class="pointer-events-none absolute inset-0 -z-10 bg-black/60"></div>
	{/if}

	<header class="relative z-[110] flex shrink-0 items-center justify-between px-6 py-8 md:px-12">
		<Button
			onclick={onClose}
			variant="glass"
			size="icon"
			class="rounded-full bg-white/5 hover:bg-white/10"
		>
			<ChevronDown class="h-8 w-8 text-white" />
		</Button>
		<div class="text-right">
			<span class="block text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Now Playing</span>
			<span class="block text-xs font-bold text-white/40">{player.currentTrack?.title}</span>
		</div>
	</header>

	<div
		class="no-scrollbar relative flex-1 overflow-y-auto px-6 py-[33dvh] text-center md:px-12"
		onscroll={handleScroll}
		bind:this={containerRef}
	>
		{#if loading}
			<div class="flex h-full items-center justify-center">
				<Loader2 class="h-10 w-10 animate-spin text-accent" />
			</div>
		{:else if error || lines.length === 0}
			<div class="flex h-full flex-col items-center justify-center gap-4 text-white/50">
				<Music2 class="h-16 w-16 opacity-10" />
				<p class="text-xl font-medium tracking-tight">{error || 'Lyrics not available'}</p>
			</div>
		{:else}
			<div class="flex flex-col gap-14 pb-[50vh] md:gap-20">
				{#each lines as line, i}
					<button
						id="lyric-line-{i}"
						class="lyric-line block w-full origin-center py-2 text-center outline-none
                        {isSynced
							? i === activeLineIndex
								? 'active-line text-white opacity-100'
								: 'text-white/5 opacity-10 scale-[0.85] filter blur-[2px]'
							: 'text-white/90 font-bold'}"
						onclick={() => {
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
								<span class={token.highlight ? 'text-accent' : ''}>{token.text}</span>
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
	.no-scrollbar::-webkit-scrollbar { display: none; }
	.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
	button:focus { outline: none; }
	.lyric-line {
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		will-change: transform, opacity;
		font-weight: 900;
		font-size: 2.25rem; /* Fallback */
	}

	@media (min-width: 768px) {
		.lyric-line { font-size: 5rem; }
	}

	@media (min-width: 1280px) {
		.lyric-line { font-size: 8rem; }
	}

	.active-line {
		transform: scale(1.15);
		text-shadow: 0 0 40px rgba(255, 255, 255, 0.2);
	}
</style>
