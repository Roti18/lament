<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { Volume2, VolumeX, Volume1 } from '@lucide/svelte';

	let previousVolume = $state(1);

	function toggleMute() {
		if (player.volume > 0) {
			previousVolume = player.volume;
			player.setVolume(0);
		} else {
			player.setVolume(previousVolume || 1);
		}
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		player.setVolume(parseFloat(target.value));
	}

	let volumeIcon = $derived.by(() => {
		if (player.volume === 0) return 'muted';
		if (player.volume < 0.5) return 'low';
		return 'high';
	});
</script>

<div class="hidden items-center gap-2 md:flex">
	<button
		onclick={toggleMute}
		class="interactive flex h-8 w-8 items-center justify-center rounded text-text-secondary hover:text-text-primary"
		aria-label={player.volume === 0 ? 'Unmute' : 'Mute'}
	>
		{#if volumeIcon === 'muted'}
			<VolumeX class="h-5 w-5" />
		{:else if volumeIcon === 'low'}
			<Volume1 class="h-5 w-5" />
		{:else}
			<Volume2 class="h-5 w-5" />
		{/if}
	</button>

	<div class="relative w-20">
		<div
			class="pointer-events-none absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-accent"
			style="width: {player.volume * 100}%"
		></div>

		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			value={player.volume}
			oninput={handleVolumeChange}
			class="relative z-10 block h-6 w-full cursor-pointer"
			aria-label="Volume"
		/>
	</div>
</div>
