<script lang="ts">
	import { clientApi } from '$lib/api';
	import { player } from '$lib/stores/player.svelte';
	import type { Track, Album, Artist, SearchResult } from '$lib/types';
	import { Search, Loader2, Play, Music, Disc, User, X } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';

	let { isOpen = $bindable(false) } = $props();

	let inputQuery = $state('');
	let isLoading = $state(false);
	let results = $state<SearchResult>({ artists: [], albums: [], tracks: [] });
	let hasSearched = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			if (inputQuery.trim()) {
				handleSearch(inputQuery.trim());
			} else {
				results = { artists: [], albums: [], tracks: [] };
				hasSearched = false;
			}
		}, 300);
	}

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

	function close() {
		isOpen = false;
		inputQuery = '';
		results = { artists: [], albums: [], tracks: [] };
		hasSearched = false;
	}

	let inputRef = $state<HTMLInputElement | null>(null);
	$effect(() => {
		if (isOpen && inputRef) {
			inputRef.focus();
		}
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="absolute inset-0 bg-black/80 backdrop-blur-sm"
			onclick={close}
			onkeydown={(e) => e.key === 'Enter' && close()}
			role="button"
			tabindex="-1"
			aria-label="Close search"
		></div>

		<div
			class="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-surface-0 shadow-2xl"
			transition:fly={{ y: -20, duration: 300 }}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="relative border-b border-white/5 p-4">
				<Search class="absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2 text-text-secondary" />
				<input
					bind:this={inputRef}
					bind:value={inputQuery}
					oninput={handleInput}
					type="search"
					placeholder="What do you want to play?"
					class="w-full rounded-xl border border-white/10 bg-surface-1 py-3 pr-12 pl-12 text-lg text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/50 focus:outline-none"
				/>
				<Button
					onclick={close}
					variant="ghost"
					size="icon"
					class="absolute top-1/2 right-6 -translate-y-1/2"
				>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<div
				class="max-h-[70vh] overflow-y-auto p-4 md:p-6"
				class:flex={!hasSearched && !isLoading}
				class:flex-col={!hasSearched && !isLoading}
				class:items-center={!hasSearched && !isLoading}
				class:justify-center={!hasSearched && !isLoading}
			>
				{#if isLoading}
					<div class="flex h-40 items-center justify-center">
						<Loader2 class="h-8 w-8 animate-spin text-accent" />
					</div>
				{:else if !inputQuery}
					<div class="flex h-40 flex-col items-center justify-center text-text-muted opacity-50">
						<Search class="mb-4 h-12 w-12" strokeWidth={1} />
						<p class="font-medium">Type to search</p>
					</div>
				{:else if hasSearched && !featuredResult && results.tracks.length === 0}
					<div class="flex h-40 flex-col items-center justify-center text-text-muted">
						<p>No results found for "{inputQuery}"</p>
					</div>
				{:else}
					<div class="grid gap-8 lg:grid-cols-[300px_1fr]">
						<div class="space-y-6">
							{#if featuredResult}
								<section>
									<h2 class="mb-4 text-xs font-bold tracking-wider text-text-secondary uppercase">
										Top Result
									</h2>
									{#if featuredResult.type === 'artist'}
										{@const artist = featuredResult.data as Artist}
										<a
											href="/artist/{artist.id}"
											onclick={close}
											class="group relative block overflow-hidden rounded-xl bg-surface-1 p-4 transition-all hover:bg-surface-2"
										>
											<div class="mb-4 aspect-square w-full overflow-hidden rounded-full shadow-lg">
												{#if artist.imageUrl}
													<img
														src={artist.imageUrl}
														alt={artist.name}
														class="h-full w-full object-cover"
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center bg-surface-3">
														<User class="h-12 w-12 text-text-muted" strokeWidth={1} />
													</div>
												{/if}
											</div>
											<h3 class="truncate text-xl font-bold text-white">{artist.name}</h3>
											<div class="mt-2 text-xs font-medium text-text-secondary">Artist</div>
										</a>
									{:else if featuredResult.type === 'album'}
										{@const album = featuredResult.data as Album}
										<a
											href="/album/{album.id}"
											onclick={close}
											class="group relative block overflow-hidden rounded-xl bg-surface-1 p-4 transition-all hover:bg-surface-2"
										>
											<div class="mb-4 aspect-square w-full overflow-hidden rounded-lg shadow-lg">
												{#if album.coverUrl}
													<img
														src={album.coverUrl}
														alt={album.title}
														class="h-full w-full object-cover"
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center bg-surface-3">
														<Disc class="h-12 w-12 text-text-muted" strokeWidth={1} />
													</div>
												{/if}
											</div>
											<h3 class="truncate text-lg font-bold text-white">{album.title}</h3>
											<p class="text-sm text-text-secondary">{album.artist}</p>
										</a>
									{:else if featuredResult.type === 'track'}
										{@const track = featuredResult.data as Track}
										<button
											onclick={() => {
												player.play(track);
												close();
											}}
											class="group relative block w-full overflow-hidden rounded-xl bg-surface-1 p-4 text-left transition-all hover:bg-surface-2"
										>
											<div class="mb-4 aspect-square w-full overflow-hidden rounded-lg shadow-lg">
												{#if track.coverUrl}
													<img
														src={track.coverUrl}
														alt={track.title}
														class="h-full w-full object-cover"
													/>
												{:else}
													<div class="flex h-full w-full items-center justify-center bg-surface-3">
														<Music class="h-12 w-12 text-text-muted" strokeWidth={1} />
													</div>
												{/if}
											</div>
											<h3 class="truncate text-lg font-bold text-white">{track.title}</h3>
											<p class="text-sm text-text-secondary">
												{track.artists.map((a) => a.name).join(', ')}
											</p>
											<div
												class="absolute right-4 bottom-4 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
											>
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black"
												>
													<Play class="ml-0.5 h-5 w-5 fill-current" />
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
									<h2 class="mb-4 text-xs font-bold tracking-wider text-text-secondary uppercase">
										Songs
									</h2>
									<div class="space-y-1">
										{#each results.tracks as track}
											<button
												onclick={() => {
													player.play(track);
													close();
												}}
												class="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-1"
											>
												<div
													class="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-2"
												>
													{#if track.coverThumb}
														<img
															src={track.coverThumb}
															alt={track.title}
															class="h-full w-full object-cover"
														/>
													{:else}
														<div class="flex h-full w-full items-center justify-center">
															<Music class="h-4 w-4 text-text-muted" />
														</div>
													{/if}
													<div
														class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
													>
														<Play class="h-4 w-4 fill-current text-white" />
													</div>
												</div>
												<div class="min-w-0 flex-grow">
													<div class="truncate font-medium text-text-primary">
														{track.title}
													</div>
													<div class="truncate text-sm text-text-secondary">
														{track.artists.map((a) => a.name).join(', ')}
													</div>
												</div>
												<div class="text-xs text-text-muted tabular-nums">
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
	</div>
{/if}
