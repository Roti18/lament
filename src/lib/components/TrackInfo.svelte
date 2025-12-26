<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { Music } from '@lucide/svelte';
</script>

<div class="min-w-0 gap-3 flex items-center">
	<div class="h-10 w-10 rounded md:h-12 md:w-12 flex-shrink-0 overflow-hidden bg-surface-2">
		{#if player.currentTrack?.coverUrl}
			<img
				src={player.currentTrack.coverUrl}
				alt={player.currentTrack.album || player.currentTrack.title}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-surface-3 text-text-muted">
				<Music class="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		{#if player.currentTrack}
			<p class="text-sm font-medium truncate text-text-primary">
				{player.currentTrack.title}
			</p>
			<p class="text-xs truncate text-text-secondary">
				{#each player.currentTrack.artists as artist, i}
					<a href="/artist/{artist.id}" class="hover:text-accent hover:underline">
						{artist.name}
					</a>
					{#if i < player.currentTrack.artists.length - 1}
						<span class="text-text-muted">, </span>
					{/if}
				{/each}
			</p>
		{:else}
			<p class="text-sm text-text-muted">No track selected</p>
		{/if}
	</div>
</div>
