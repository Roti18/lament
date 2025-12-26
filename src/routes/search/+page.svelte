<script lang="ts">
	import { page } from '$app/state';
	import { clientApi } from '$lib/api';
	import { player } from '$lib/stores/player.svelte';
	import type { Track, Album, Artist, SearchResult } from '$lib/types';
	import { Search, Loader2, Play, Music, Disc, User } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';

	let query = $derived(page.url.searchParams.get('q') || '');
	let inputQuery = $state(page.url.searchParams.get('q') || '');

	$effect(() => {
		const q = query;
		if (q !== untrack(() => inputQuery)) {
			inputQuery = q;
		}
	});

	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			if (inputQuery.trim() !== query) {
				const url = inputQuery.trim()
					? `/search?q=${encodeURIComponent(inputQuery.trim())}`
					: '/search';
				goto(url, { keepFocus: true, replaceState: true, noScroll: true });
			}
		}, 300);
	}

	let isLoading = $state(false);
	let results = $state<SearchResult>({ artists: [], albums: [], tracks: [] });
	let hasSearched = $state(false);

	$effect(() => {
		if (query) {
			handleSearch(query);
		} else {
			results = { artists: [], albums: [], tracks: [] };
			hasSearched = false;
		}
	});

	async function handleSearch(q: string) {
		if (!q.trim()) return;
		isLoading = true;
		hasSearched = true;
		try {
			const res = await clientApi.search(q);
			results = res;
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isLoading = false;
		}
	}

	let featuredResult = $derived.by(() => {
		if (results.artists.length > 0) return { type: 'artist', data: results.artists[0] };
		if (results.albums.length > 0) return { type: 'album', data: results.albums[0] };
		if (results.tracks.length > 0) return { type: 'track', data: results.tracks[0] };
		return null;
	});

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Search | lament</title>
</svelte:head>

<div class="pb-20 min-h-full">
	<header
		class="top-0 -mx-4 mb-8 gap-4 border-white/5 px-4 py-4 backdrop-blur-xl md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8 sticky z-30 flex flex-col border-b bg-surface-0/80"
	>
		<h1 class="text-2xl font-bold md:block hidden text-text-primary">Search</h1>

		<div class="max-w-md relative w-full">
			<Search
				class="left-4 h-5 w-5 absolute top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-text-primary"
			/>
			<input
				bind:value={inputQuery}
				oninput={handleInput}
				type="search"
				placeholder="What do you want to play?"
				class="py-3 pr-4 pl-12 backdrop-blur-sm w-full rounded-full border-none bg-surface-2/40 text-text-primary transition-all !outline-none placeholder:text-text-muted hover:bg-surface-2/60 focus:bg-surface-2/80 focus:!ring-2 focus:!ring-accent/50"
			/>
		</div>
	</header>

	<div class="px-2 md:px-4">
		{#if isLoading}
			<div class="h-64 flex items-center justify-center">
				<Loader2 class="h-8 w-8 animate-spin text-accent" />
			</div>
		{:else if !query}
			<div class="flex h-[50vh] flex-col items-center justify-center text-text-muted opacity-50">
				<Search class="mb-6 h-16 w-16" strokeWidth={1} />
				<p class="text-lg font-medium">Find your favorite artists, albums, or songs</p>
			</div>
		{:else if hasSearched && !featuredResult && results.tracks.length === 0}
			<div class="h-64 flex flex-col items-center justify-center text-text-muted">
				<p>No results found for "{query}"</p>
			</div>
		{:else}
			<div class="gap-8 lg:grid-cols-[400px_1fr] grid">
				<div class="space-y-6">
					{#if featuredResult}
						<section>
							<h2 class="mb-4 text-xl font-bold text-text-primary">Top Result</h2>
							{#if featuredResult.type === 'artist'}
								{@const artist = featuredResult.data as Artist}
								<a
									href="/artist/{artist.id}"
									class="group p-6 relative block overflow-hidden rounded-md bg-surface-1/40 transition-all hover:bg-surface-1"
								>
									<div class="mb-6 w-32 shadow-lg aspect-square overflow-hidden rounded-full">
										{#if artist.imageUrl}
											<img
												src={artist.imageUrl}
												alt={artist.name}
												class="h-full w-full object-cover"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center bg-surface-3">
												<User class="h-16 w-16 text-text-muted" strokeWidth={1} />
											</div>
										{/if}
									</div>
									<h3 class="text-3xl font-bold text-text-primary">{artist.name}</h3>
									<div
										class="mt-2 px-3 py-1 text-xs font-bold tracking-wide inline-flex items-center rounded-full bg-surface-0/50 text-text-primary uppercase"
									>
										Artist
									</div>

									<div
										class="right-4 bottom-4 translate-y-2 shadow-xl group-hover:translate-y-0 absolute opacity-0 transition-all duration-300 group-hover:opacity-100"
									>
										<div
											class="h-12 w-12 text-black flex items-center justify-center rounded-full bg-accent"
										>
											<Play class="ml-1 h-6 w-6 fill-current" />
										</div>
									</div>
								</a>
							{:else if featuredResult.type === 'album'}
								{@const album = featuredResult.data as Album}
								<a
									href="/album/{album.id}"
									class="group p-6 relative block overflow-hidden rounded-md bg-surface-1/40 transition-all hover:bg-surface-1"
								>
									<div class="mb-6 w-32 rounded shadow-lg aspect-square overflow-hidden">
										{#if album.coverUrl}
											<img
												src={album.coverUrl}
												alt={album.title}
												class="h-full w-full object-cover"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center bg-surface-3">
												<Disc class="h-16 w-16 text-text-muted" strokeWidth={1} />
											</div>
										{/if}
									</div>
									<h3 class="text-2xl font-bold line-clamp-1 text-text-primary">
										{album.title}
									</h3>
									<p class="mt-1 text-sm text-text-secondary">
										Album • <span class="font-medium text-text-primary">{album.artist}</span>
									</p>

									<div
										class="right-4 bottom-4 translate-y-2 shadow-xl group-hover:translate-y-0 absolute opacity-0 transition-all duration-300 group-hover:opacity-100"
									>
										<div
											class="h-12 w-12 text-black flex items-center justify-center rounded-full bg-accent"
										>
											<Play class="ml-1 h-6 w-6 fill-current" />
										</div>
									</div>
								</a>
							{:else if featuredResult.type === 'track'}
								{@const track = featuredResult.data as Track}
								<button
									onclick={() => player.play(track)}
									class="group p-6 relative block w-full overflow-hidden rounded-md bg-surface-1/40 text-left transition-all hover:bg-surface-1"
								>
									<div class="mb-6 w-32 rounded shadow-lg aspect-square overflow-hidden">
										{#if track.coverUrl}
											<img
												src={track.coverUrl}
												alt={track.title}
												class="h-full w-full object-cover"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center bg-surface-3">
												<Music class="h-16 w-16 text-text-muted" strokeWidth={1} />
											</div>
										{/if}
									</div>
									<h3 class="text-2xl font-bold line-clamp-1 text-text-primary">
										{track.title}
									</h3>
									<p class="mt-1 text-sm text-text-secondary">
										Song • <span class="font-medium text-text-primary"
											>{track.artists.map((a) => a.name).join(', ')}</span
										>
									</p>

									<div
										class="right-4 bottom-4 translate-y-2 shadow-xl group-hover:translate-y-0 absolute opacity-0 transition-all duration-300 group-hover:opacity-100"
									>
										<div
											class="h-12 w-12 text-black flex items-center justify-center rounded-full bg-accent"
										>
											<Play class="ml-1 h-6 w-6 fill-current" />
										</div>
									</div>
								</button>
							{/if}
						</section>
					{/if}
				</div>

				<div class="min-w-0">
					{#if results.tracks.length > 0}
						<section>
							<h2 class="mb-4 text-xl font-bold text-text-primary">Songs</h2>
							<div class="flex flex-col">
								{#each results.tracks as track}
									<button
										onclick={() => player.play(track)}
										class="group gap-4 p-2 flex w-full items-center rounded-md text-left transition-colors hover:bg-surface-1/50"
									>
										<div class="h-10 w-10 rounded relative flex-shrink-0 overflow-hidden">
											{#if track.coverThumb}
												<img
													src={track.coverThumb}
													alt={track.title}
													class="h-full w-full object-cover"
													loading="lazy"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-surface-2 text-text-muted"
												>
													<Music class="h-4 w-4" />
												</div>
											{/if}
											<div
												class="inset-0 bg-black/40 absolute flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
											>
												<Play class="h-4 w-4 text-white fill-current" />
											</div>
										</div>

										<div class="min-w-0 flex-grow">
											<div
												class="font-medium truncate text-text-primary transition-colors group-hover:text-accent"
											>
												{track.title}
											</div>
											<div class="text-sm truncate text-text-secondary">
												{track.artists.map((a) => a.name).join(', ')}
											</div>
										</div>

										<div class="text-sm text-text-muted tabular-nums">
											{formatTime(track.duration)}
										</div>
									</button>
								{/each}
							</div>
						</section>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
