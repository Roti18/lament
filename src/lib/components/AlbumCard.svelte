<script lang="ts">
	import type { Album } from '$lib/types';
	import { Play, Disc } from '@lucide/svelte';

	interface Props {
		album?: Album;
		loading?: boolean;
	}

	let { album, loading = false }: Props = $props();
</script>

{#if loading || !album}
	<div class="block">
		<div class="skeleton mb-3 aspect-square rounded-lg"></div>
		<div class="skeleton mb-2 h-4 w-3/4 rounded"></div>
		<div class="skeleton h-3 w-1/2 rounded"></div>
	</div>
{:else}
	<a href="/album/{album.id}" class="group block">
		<div class="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface-2">
			{#if album.coverThumb}
				<img
					src={album.coverThumb}
					alt={album.title}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center bg-surface-3 text-text-muted transition-transform duration-300 group-hover:scale-105"
				>
					<Disc class="h-12 w-12" strokeWidth={1} />
				</div>
			{/if}
			<div
				class="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
			>
				<Play class="h-4 w-4 translate-x-0.5 text-surface-0" fill="currentColor" />
			</div>
		</div>

		<h3
			class="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-accent"
		>
			{album.title}
		</h3>
		<p class="truncate text-xs text-text-secondary">
			{album.artist}
			{#if album.releaseYear}
				<span class="text-text-muted"> · {album.releaseYear}</span>
			{/if}
		</p>
	</a>
{/if}
