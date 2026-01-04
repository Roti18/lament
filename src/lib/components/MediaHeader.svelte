<script lang="ts">
	import { Play, Shuffle, Disc } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		type: 'playlist' | 'album' | 'artist';
		title: string;
		coverUrl?: string;
		onPlay: () => void;
		onShuffle?: () => void;
		meta?: Snippet;
		subtitle?: Snippet;
	}

	let { type, title, coverUrl, onPlay, onShuffle, meta, subtitle }: Props = $props();

	const typeLabel = $derived(
		type === 'playlist' ? 'Playlist' : type === 'album' ? 'Album' : 'Artist'
	);
</script>

<header class="mb-6 flex flex-row items-start gap-3 md:mb-8 md:items-end md:gap-6">
	<div class="w-28 flex-shrink-0 md:w-56">
		<div
			class="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-2 shadow-xl"
		>
			{#if coverUrl}
				<img src={coverUrl} alt={title} class="h-full w-full object-cover" />
			{:else}
				<Disc class="h-10 w-10 text-text-muted opacity-50 md:h-24 md:w-24" strokeWidth={1} />
			{/if}
		</div>
	</div>

	<div class="flex min-w-0 flex-1 flex-col">
		<p class="text-[10px] font-medium tracking-wider text-text-muted uppercase md:text-xs">
			{typeLabel}
		</p>
		<h1 class="mt-0.5 truncate text-lg font-bold text-text-primary md:mt-1 md:text-4xl">
			{title}
		</h1>

		{#if subtitle}
			<div class="mt-0.5 md:mt-2">
				{@render subtitle()}
			</div>
		{/if}

		{#if meta}
			<div class="mt-1 text-[10px] text-text-muted md:mt-2 md:text-xs">
				{@render meta()}
			</div>
		{/if}

		<div class="mt-2.5 flex gap-2 md:mt-4 md:gap-3">
			<button
				onclick={onPlay}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-surface-0 transition-opacity hover:opacity-90 md:h-10 md:w-10"
				aria-label="Play all"
			>
				<Play class="h-3.5 w-3.5 fill-current md:h-5 md:w-5" />
			</button>
			{#if onShuffle}
				<button
					onclick={onShuffle}
					class="flex h-8 w-8 items-center justify-center rounded-full border border-surface-3 text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary md:h-10 md:w-10"
					aria-label="Shuffle play"
				>
					<Shuffle class="h-3.5 w-3.5 md:h-5 md:w-5" />
				</button>
			{/if}
		</div>
	</div>
</header>
