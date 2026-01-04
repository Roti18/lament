<script lang="ts">
	import type { Artist } from '$lib/types';
	import { User } from '@lucide/svelte';

	interface Props {
		artist: Artist;
	}

	let { artist }: Props = $props();
</script>

<a href="/artist/{artist.id}" class="group flex flex-col items-center text-center">
	<div
		class="relative mb-3 aspect-square w-full max-w-32 overflow-hidden rounded-full bg-surface-2"
	>
		{#if artist.imageThumb}
			<img
				src={artist.imageThumb}
				alt={artist.name}
				class="h-full w-full object-cover transition-transform duration-300"
				loading="lazy"
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-surface-3 text-text-muted transition-transform duration-300"
			>
				<User class="h-10 w-10" />
			</div>
		{/if}
	</div>

	<h3 class="text-sm font-medium text-text-primary transition-colors group-hover:text-accent">
		{artist.name}
	</h3>
	<p class="text-xs text-text-muted">Artist</p>
</a>
