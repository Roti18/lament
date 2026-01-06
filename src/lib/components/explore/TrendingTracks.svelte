<script lang="ts">
	import { clientApi } from '$lib/api';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { onMount } from 'svelte';
	import type { Track } from '$lib/types';

	let tracks = $state<Track[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			tracks = await clientApi.getTrendingTracks();
		} catch (e: any) {
			error = e.message || 'Failed to load tracks';
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold text-text-primary">Trending Now</h2>

	{#if error}
		<Alert variant="error">
			{error}
		</Alert>
	{:else if loading && tracks.length === 0}
		<div class="space-y-4">
			{#each Array(5) as _}
				<div class="flex items-center space-x-4">
					<Skeleton width="48px" height="48px" borderRadius="4px" />
					<div class="flex-1 space-y-2">
						<Skeleton width="60%" height="1.2rem" />
						<Skeleton width="40%" height="1rem" />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="space-y-1">
			{#each tracks.slice(0, 10) as track, i}
				<TrackCard {track} index={i} showIndex />
			{/each}
		</div>
	{/if}
</div>
