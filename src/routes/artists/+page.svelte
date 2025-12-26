<!--
  Artists Listing View
-->
<script lang="ts">
	import ArtistCard from '$lib/components/ArtistCard.svelte';

	let { data } = $props();
	let artists = $derived(data.artists);
</script>

<svelte:head>
	<title>Artists | lament</title>
</svelte:head>

<div class="py-6">
	<header class="mb-6">
		<h1 class="text-lg font-semibold text-text-primary">Artists</h1>
		<p class="text-sm text-text-secondary">{artists.length} artists</p>
	</header>

	<div class="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
		{#each artists as artist}
			<ArtistCard {artist} />
		{/each}
	</div>
</div>
