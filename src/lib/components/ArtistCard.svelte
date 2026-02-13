<script lang="ts">
	import type { Artist } from '$lib/types';
	import { User } from '@lucide/svelte';

	interface Props {
		artist?: Artist;
		loading?: boolean;
	}

	let { artist, loading = false }: Props = $props();
</script>

{#if loading || !artist}
	<div class="flex flex-col items-center text-center">
		<div class="skeleton mb-3 aspect-square w-full max-w-32 rounded-full"></div>
		<div class="skeleton h-4 w-20 rounded"></div>
	</div>
{:else}
	<a href="/artist/{artist.id}" class="group flex flex-col items-center text-center">
		<div
			class="relative mb-3 aspect-square w-full max-w-32 overflow-hidden rounded-full bg-surface-2"
		>
			{#if artist.imageThumb}
				<img
					src={artist.imageThumb}
					alt={artist.name}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center bg-surface-3 text-text-muted transition-transform duration-300 group-hover:scale-105"
				>
					<User class="h-10 w-10" />
				</div>
			{/if}
		</div>

		<h3 class="text-sm font-medium text-text-primary transition-colors group-hover:text-accent line-clamp-1">
			{artist.name}
		</h3>
		<p class="text-xs text-text-muted">Artist</p>
	</a>
{/if}
