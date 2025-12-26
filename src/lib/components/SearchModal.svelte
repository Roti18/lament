<script lang="ts">
	import { searchStore } from '$lib/stores/search.svelte';
	import { clientApi } from '$lib/api';
	import { fade, fly } from 'svelte/transition';
	import { Search, X, Music, Disc, User, Loader2, Play } from '@lucide/svelte';
	import type { Track, Album, Artist, SearchResult } from '$lib/types';
	import { player } from '$lib/stores/player.svelte';

	let query = $state('');
	let isLoading = $state(false);
	let results = $state<SearchResult>({ artists: [], albums: [], tracks: [] });
	let timeout: NodeJS.Timeout;

	let featuredResult = $derived.by(() => {
		if (results.artists.length > 0) return { type: 'artist', data: results.artists[0] };
		if (results.albums.length > 0) return { type: 'album', data: results.albums[0] };
		if (results.tracks.length > 0) return { type: 'track', data: results.tracks[0] };
		return null;
	});

	function close() {
		searchStore.close();
		query = '';
		results = { artists: [], albums: [], tracks: [] };
	}

	function handleInput() {
		isLoading = true;
		clearTimeout(timeout);
		timeout = setTimeout(async () => {
			if (!query.trim()) {
				results = { artists: [], albums: [], tracks: [] };
				isLoading = false;
				return;
			}
			try {
				const res = await clientApi.search(query.trim());
				results = res;
			} catch (err) {
				console.error(err);
			} finally {
				isLoading = false;
			}
		}, 300);
	}

	function focus(element: HTMLElement) {
		element.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			searchStore.toggle();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if searchStore.isOpen}
	<div
		class="inset-0 bg-black/50 p-4 backdrop-blur-sm sm:pt-20 fixed z-50 flex items-start justify-center"
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
		onclick={close}
		tabindex="-1"
		onkeydown={() => {}}
	>
		<div
			class="glass max-w-4xl rounded-2xl border-white/10 shadow-2xl w-full overflow-hidden border"
			transition:fly={{ y: 20, duration: 250 }}
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onkeydown={() => {}}
		>
			<div class="border-white/5 p-4 relative border-b">
				<Search class="left-6 h-5 w-5 absolute top-1/2 -translate-y-1/2 text-text-secondary" />
				<input
					bind:value={query}
					oninput={handleInput}
					type="search"
					use:focus
					placeholder="Search for tracks, albums, or artists..."
					class="py-2 pr-4 pl-12 text-lg w-full bg-transparent text-text-primary !outline-none placeholder:text-text-muted focus:!ring-2 focus:!ring-accent/40"
				/>
				<div class="right-4 gap-2 absolute top-1/2 flex -translate-y-1/2 items-center">
					<kbd class="rounded px-2 py-0.5 text-xs md:block hidden bg-surface-3 text-text-muted"
						>ESC</kbd
					>
					<button
						onclick={close}
						class="p-1 rounded-full text-text-secondary hover:bg-surface-2 hover:text-text-primary"
					>
						<X class="h-5 w-5" />
					</button>
				</div>
			</div>

			<div class="scrollbar-hidden p-6 max-h-[70vh] min-h-[300px] overflow-y-auto">
				{#if isLoading}
					<div class="py-20 flex h-full items-center justify-center">
						<Loader2 class="h-8 w-8 animate-spin text-accent" />
					</div>
				{:else if !query}
					<div
						class="py-20 flex h-full flex-col items-center justify-center text-text-muted opacity-50"
					>
						<Search class="mb-4 h-12 w-12" strokeWidth={1} />
						<p>Search for your favorite music</p>
					</div>
				{:else if !featuredResult && results.tracks.length === 0}
					<div class="py-20 flex h-full flex-col items-center justify-center text-text-muted">
						<p>No results found for "{query}"</p>
					</div>
				{:else}
					<div class="gap-8 md:grid-cols-[1fr_1.5fr] grid">
						{#if featuredResult}
							<div class="space-y-4">
								<h3 class="text-xs font-semibold tracking-wider text-text-secondary uppercase">
									Top Result
								</h3>
								{#if featuredResult.type === 'artist'}
									{@const artist = featuredResult.data as Artist}
									<a
										href="/artist/{artist.id}"
										onclick={close}
										class="group p-6 block rounded-xl bg-surface-1 transition-colors hover:bg-surface-2"
									>
										<div
											class="mb-6 shadow-lg relative aspect-square w-full overflow-hidden rounded-full"
										>
											{#if artist.imageUrl}
												<img
													src={artist.imageUrl}
													alt={artist.name}
													class="h-full w-full object-cover"
												/>
											{:else}
												<div class="flex h-full w-full items-center justify-center bg-surface-3">
													<User class="h-20 w-20 text-text-muted" strokeWidth={1} />
												</div>
											{/if}
										</div>
										<h2 class="text-2xl font-bold text-text-primary">{artist.name}</h2>
										<div
											class="mt-2 text-sm font-medium tracking-tight text-text-secondary uppercase"
										>
											Artist
										</div>
									</a>
								{:else if featuredResult.type === 'album'}
									{@const album = featuredResult.data as Album}
									<a
										href="/album/{album.id}"
										onclick={close}
										class="group p-6 block rounded-xl bg-surface-1 transition-colors hover:bg-surface-2"
									>
										<div
											class="mb-6 shadow-lg relative aspect-square w-full overflow-hidden rounded-lg"
										>
											{#if album.coverUrl}
												<img
													src={album.coverUrl}
													alt={album.title}
													class="h-full w-full object-cover"
												/>
											{:else}
												<div class="flex h-full w-full items-center justify-center bg-surface-3">
													<Disc class="h-20 w-20 text-text-muted" strokeWidth={1} />
												</div>
											{/if}
										</div>
										<h2 class="text-2xl font-bold text-text-primary">{album.title}</h2>
										<div class="mt-1 text-base text-text-secondary">{album.artist}</div>
										<div
											class="mt-4 px-3 py-1 text-xs font-medium inline-block rounded-full bg-surface-3 text-text-secondary"
										>
											Album
										</div>
									</a>
								{:else if featuredResult.type === 'track'}
									{@const track = featuredResult.data as Track}
									<button
										onclick={() => {
											player.play(track);
											close();
										}}
										class="group p-6 block w-full rounded-xl bg-surface-1 text-left transition-colors hover:bg-surface-2"
									>
										<div
											class="mb-6 shadow-lg relative aspect-square w-full overflow-hidden rounded-lg"
										>
											{#if track.coverUrl}
												<img
													src={track.coverUrl}
													alt={track.title}
													class="h-full w-full object-cover"
												/>
											{:else}
												<div class="flex h-full w-full items-center justify-center bg-surface-3">
													<Music class="h-20 w-20 text-text-muted" strokeWidth={1} />
												</div>
											{/if}
											<div
												class="inset-0 bg-black/20 absolute flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
											>
												<div
													class="p-4 shadow-xl scale-90 transform rounded-full bg-accent text-surface-0 transition-transform group-hover:scale-100"
												>
													<Play class="h-8 w-8 translate-x-1 fill-current" />
												</div>
											</div>
										</div>
										<h2 class="text-2xl font-bold text-text-primary">{track.title}</h2>
										<div class="mt-1 text-base text-text-secondary">
											{track.artists.map((a) => a.name).join(', ')}
										</div>
										<div
											class="mt-4 px-3 py-1 text-xs font-medium inline-block rounded-full bg-surface-3 text-text-secondary"
										>
											Track
										</div>
									</button>
								{/if}
							</div>
						{/if}

						{#if results.tracks.length > 0}
							<div class="space-y-4">
								<h3 class="text-xs font-semibold tracking-wider text-text-secondary uppercase">
									Songs
								</h3>
								<div class="space-y-1">
									{#each results.tracks.slice(0, 10) as track}
										<button
											onclick={() => {
												player.play(track);
												close();
											}}
											class="group gap-3 p-2 flex w-full items-center rounded-lg text-left transition-colors hover:bg-surface-2"
										>
											<div
												class="h-12 w-12 rounded relative flex-shrink-0 overflow-hidden bg-surface-2"
											>
												{#if track.coverThumb}
													<img
														src={track.coverThumb}
														alt={track.title}
														class="h-full w-full object-cover"
														loading="lazy"
													/>
												{:else}
													<div
														class="flex h-full w-full items-center justify-center text-text-muted"
													>
														<Music class="h-5 w-5" />
													</div>
												{/if}
												<div
													class="inset-0 bg-black/40 absolute flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
												>
													<Play class="h-4 w-4 text-white fill-current" />
												</div>
											</div>
											<div class="min-w-0 flex-1">
												<div class="font-medium truncate text-text-primary group-hover:text-accent">
													{track.title}
												</div>
												<div class="text-sm truncate text-text-secondary">
													{track.artists.map((a) => a.name).join(', ')}
												</div>
												<div class="text-xs text-text-muted tabular-nums">
													{Math.floor(track.duration / 60)}:{(track.duration % 60)
														.toString()
														.padStart(2, '0')}
												</div>
											</div></button
										>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
