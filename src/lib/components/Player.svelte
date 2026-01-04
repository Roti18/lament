<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import SeekBar from './SeekBar.svelte';
	import VolumeControl from './VolumeControl.svelte';
	import TrackInfo from './TrackInfo.svelte';
	import Lyrics from './Lyrics.svelte';
	import {
		Play,
		Pause,
		SkipBack,
		SkipForward,
		Loader2,
		Shuffle,
		Repeat,
		Repeat1,
		Mic2
	} from '@lucide/svelte';

	$effect(() => {
		player.init();
	});

	let showLyrics = $state(false);

	function getRepeatIcon() {
		if (player.repeatMode === 'one') return Repeat1;
		return Repeat;
	}
</script>

{#if showLyrics}
	<Lyrics onClose={() => (showLyrics = false)} />
{/if}

<div
	class="glass-nav transition-theme fixed right-0 bottom-[calc(var(--mobile-nav-bottom-total)-1px)] left-0 z-50 lg:bottom-0"
	role="region"
	aria-label="Audio player"
>
	<div class="flex flex-col px-3 py-2.5 md:hidden">
		<div class="-mx-3 mb-2 px-3">
			<SeekBar />
		</div>

		<div class="flex items-center justify-between">
			<TrackInfo />

			<div class="flex items-center gap-0">
				<button
					onclick={() => (showLyrics = !showLyrics)}
					class="interactive hidden h-8 w-8 items-center justify-center transition-colors md:flex {showLyrics
						? 'text-accent'
						: 'text-text-secondary hover:text-text-primary'}"
					aria-label="Toggle Lyrics"
				>
					<Mic2 class="h-4 w-4" />
				</button>

				<button
					onclick={() => player.toggleShuffle()}
					class="interactive flex h-8 w-8 items-center justify-center transition-colors {player.shuffleEnabled
						? 'text-accent'
						: 'text-text-secondary hover:text-text-primary'}"
					aria-label="Toggle shuffle"
				>
					<Shuffle class="h-3.5 w-3.5" />
				</button>

				<button
					onclick={() => player.previous()}
					disabled={player.queue.length === 0}
					class="interactive flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
					aria-label="Previous track"
				>
					<SkipBack class="h-4 w-4" fill="currentColor" />
				</button>

				<button
					onclick={() => player.toggle()}
					disabled={!player.currentTrack}
					class="interactive flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 hover:bg-accent-hover disabled:opacity-40"
					aria-label={player.isPlaying ? 'Pause' : 'Play'}
				>
					{#if player.isBuffering}
						<Loader2 class="h-5 w-5 animate-spin" />
					{:else if player.isPlaying}
						<Pause class="h-5 w-5" fill="currentColor" />
					{:else}
						<Play class="h-5 w-5 translate-x-0.5" fill="currentColor" />
					{/if}
				</button>

				<button
					onclick={() => player.next()}
					disabled={player.queueIndex >= player.queue.length - 1 && player.repeatMode !== 'all'}
					class="interactive flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
					aria-label="Next track"
				>
					<SkipForward class="h-4 w-4" fill="currentColor" />
				</button>

				<button
					onclick={() => {
						const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
						const current = modes.indexOf(player.repeatMode);
						player.setRepeatMode(modes[(current + 1) % modes.length]);
					}}
					class="interactive flex h-8 w-8 items-center justify-center transition-colors {player.repeatMode !==
					'off'
						? 'text-accent'
						: 'text-text-secondary hover:text-text-primary'}"
					aria-label="Change repeat mode"
				>
					{#if player.repeatMode === 'one'}
						<Repeat1 class="h-3.5 w-3.5" />
					{:else}
						<Repeat class="h-3.5 w-3.5" />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<div class="hidden px-4 py-3 md:block">
		<div class="mx-auto grid max-w-7xl grid-cols-[1fr_2fr_1fr] items-center gap-4">
			<TrackInfo />

			<div class="flex flex-col items-center gap-2">
				<div class="flex items-center gap-4">
					<button
						onclick={() => player.toggleShuffle()}
						class="interactive flex h-8 w-8 items-center justify-center transition-colors {player.shuffleEnabled
							? 'text-accent'
							: 'text-text-secondary hover:text-text-primary'}"
						aria-label="Shuffle"
					>
						<Shuffle class="h-4 w-4" />
					</button>

					<button
						onclick={() => player.previous()}
						disabled={player.queue.length === 0}
						class="interactive flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
						aria-label="Previous track"
					>
						<SkipBack class="h-4 w-4" fill="currentColor" />
					</button>

					<button
						onclick={() => player.toggle()}
						disabled={!player.currentTrack}
						class="interactive flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface-0 shadow-lg transition-transform hover:bg-accent-hover active:scale-95 disabled:opacity-40"
						aria-label={player.isPlaying ? 'Pause' : 'Play'}
					>
						{#if player.isBuffering}
							<Loader2 class="h-5 w-5 animate-spin" />
						{:else if player.isPlaying}
							<Pause class="h-5 w-5" fill="currentColor" />
						{:else}
							<Play class="h-5 w-5 translate-x-0.5" fill="currentColor" />
						{/if}
					</button>

					<button
						onclick={() => player.next()}
						disabled={player.queueIndex >= player.queue.length - 1 && player.repeatMode !== 'all'}
						class="interactive flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-40"
						aria-label="Next track"
					>
						<SkipForward class="h-4 w-4" fill="currentColor" />
					</button>

					<button
						onclick={() => {
							const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
							const current = modes.indexOf(player.repeatMode);
							player.setRepeatMode(modes[(current + 1) % modes.length]);
						}}
						class="interactive flex h-8 w-8 items-center justify-center transition-colors {player.repeatMode !==
						'off'
							? 'text-accent'
							: 'text-text-secondary hover:text-text-primary'}"
						aria-label="Change repeat mode"
					>
						{#if player.repeatMode === 'one'}
							<Repeat1 class="h-4 w-4" />
						{:else}
							<Repeat class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<div class="w-full max-w-xl">
					<SeekBar />
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 pr-2">
				<button
					onclick={() => (showLyrics = !showLyrics)}
					class="interactive flex h-8 w-8 items-center justify-center transition-colors {showLyrics
						? 'text-accent'
						: 'text-text-secondary hover:text-text-primary'}"
					aria-label="Lyrics"
				>
					<Mic2 class="h-4 w-4" />
				</button>
				<VolumeControl />
			</div>
		</div>
	</div>
</div>
