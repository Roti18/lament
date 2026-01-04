<script lang="ts">
	import AlbumCard from '$lib/components/AlbumCard.svelte';

	let { data } = $props();
	let albums = $derived(data.albums);
</script>

<svelte:head>
	<title>Albums | lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-6">
		<h1 class="text-2xl font-bold text-text-primary">Albums</h1>
		<p class="mt-1 text-sm text-text-secondary">{albums.length} albums</p>
	</header>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each albums as album}
			<AlbumCard {album} />
		{/each}
	</div>
</div>
