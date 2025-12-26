<script lang="ts">
	import { player } from '$lib/stores/player.svelte';

	let isDragging = $state(false);
	let seekValue = $state(0);

	let displayTime = $derived(isDragging ? seekValue : player.currentTime);
	let progress = $derived(player.duration > 0 ? (displayTime / player.duration) * 100 : 0);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		seekValue = parseFloat(target.value);
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		player.seek(parseFloat(target.value));
		isDragging = false;
	}

	function handleMouseDown() {
		isDragging = true;
		seekValue = player.currentTime;
	}

	function handleTouchStart() {
		isDragging = true;
		seekValue = player.currentTime;
	}
</script>

<div class="flex w-full items-center gap-2 md:gap-3">
	<span class="w-10 text-right text-xs text-text-muted tabular-nums md:w-12">
		{player.formatTime(displayTime)}
	</span>

	<div class="relative flex-1">
		<!-- Progress track (filled portion) -->
		<div
			class="pointer-events-none absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)]"
			style="width: {progress}%"
		></div>

		<input
			type="range"
			min="0"
			max={player.duration || 100}
			step="0.1"
			value={displayTime}
			oninput={handleInput}
			onchange={handleChange}
			onmousedown={handleMouseDown}
			ontouchstart={handleTouchStart}
			class="relative z-10 h-6 w-full cursor-pointer"
			aria-label="Seek"
		/>
	</div>

	<span class="w-10 text-xs text-text-muted tabular-nums md:w-12">
		{player.formatTime(player.duration)}
	</span>
</div>
