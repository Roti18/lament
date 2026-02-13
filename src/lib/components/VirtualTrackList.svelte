<script lang="ts">
	import type { Track } from '$lib/types';
	import TrackCard from '$lib/components/TrackCard.svelte';

	interface Props {
		tracks: Track[];
		itemHeight?: number;
		overscan?: number;
	}

	let { tracks, itemHeight = 56, overscan = 5 }: Props = $props();

	let container: HTMLDivElement;
	let scrollTop = $state(0);
	let containerHeight = $state(400);

	const totalHeight = $derived(tracks.length * itemHeight);
	const startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));
	const endIndex = $derived(
		Math.min(tracks.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
	);
	const visibleTracks = $derived(tracks.slice(startIndex, endIndex));
	const offsetY = $derived(startIndex * itemHeight);

	function handleScroll(e: Event) {
		const target = e.target as HTMLDivElement;
		scrollTop = target.scrollTop;
	}

	$effect(() => {
		if (container) {
			containerHeight = container.clientHeight;
			const observer = new ResizeObserver((entries) => {
				containerHeight = entries[0].contentRect.height;
			});
			observer.observe(container);
			return () => observer.disconnect();
		}
	});
</script>

<div
	bind:this={container}
	class="virtual-list-container"
	onscroll={handleScroll}
>
	<div class="virtual-list-spacer" style="height: {totalHeight}px">
		<div class="virtual-list-content" style="transform: translateY({offsetY}px)">
			{#each visibleTracks as track, i (track.id)}
				<TrackCard {track} index={startIndex + i} showIndex />
			{/each}
		</div>
	</div>
</div>

<style>
	.virtual-list-container {
		overflow-y: auto;
		height: 100%;
		max-height: 80vh;
		min-height: 400px;
	}

	.virtual-list-spacer {
		position: relative;
	}

	.virtual-list-content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}
</style>
