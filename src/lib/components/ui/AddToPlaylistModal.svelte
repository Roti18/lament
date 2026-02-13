<script lang="ts">
	import { X, Plus, ListMusic, Check, Loader2 } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { clientApi } from '$lib/api';
	import type { Playlist, Track } from '$lib/types';
	import Alert from './Alert.svelte';
	import Button from './Button.svelte';

	let { open = $bindable(false), track } = $props<{
		open: boolean;
		track: Track;
	}>();

	let playlists = $state<Playlist[]>([]);
	let loading = $state(true);
	let addingTo = $state<string | null>(null);
	let addedTo = $state<Set<string>>(new Set());
	let error = $state('');

	$effect(() => {
		if (open) {
			loadPlaylists();
		}
	});

	async function loadPlaylists() {
		loading = true;
		error = '';
		try {
			playlists = await clientApi.getMyPlaylists();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load playlists';
		} finally {
			loading = false;
		}
	}

	async function addToPlaylist(playlistId: string) {
		if (addingTo || addedTo.has(playlistId)) return;

		addingTo = playlistId;
		try {
			await clientApi.addTrackToPlaylist(playlistId, track.id);
			addedTo = new Set([...addedTo, playlistId]);
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to add track';
		} finally {
			addingTo = null;
		}
	}

	function close() {
		open = false;
		addedTo = new Set();
		error = '';
	}

	function getTrackCount(playlist: Playlist): number {
		const raw = playlist as unknown as { total_tracks?: number };
		return raw.total_tracks ?? playlist.trackCount ?? 0;
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="-1"
	>
		<div
			class="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-0 shadow-2xl"
			transition:fly={{ y: 20, duration: 300 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			tabindex="0"
		>
			<div class="flex items-center justify-between border-b border-white/5 p-4">
				<div class="min-w-0 flex-1">
					<h2 id="modal-title" class="text-base font-bold text-text-primary">Add to Playlist</h2>
					<p class="mt-1 truncate text-xs text-text-muted">
						"{track.title}"
					</p>
				</div>
				<Button onclick={close} variant="ghost" size="icon" class="rounded-lg" aria-label="Close">
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="max-h-[60vh] overflow-y-auto p-4">
				{#if error}
					<Alert variant="error" class="mb-4">
						{error}
					</Alert>
				{/if}

				{#if loading}
					<div class="flex items-center justify-center py-12">
						<Loader2 class="h-6 w-6 animate-spin text-accent" />
					</div>
				{:else if playlists.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-text-muted"
						>
							<ListMusic class="h-6 w-6" />
						</div>
						<p class="mt-4 text-sm text-text-secondary">No playlists yet</p>
						<Button variant="primary" size="sm" href="/library/playlists" class="mt-4">
							Create Playlist
						</Button>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each playlists as playlist}
							{@const isAdded = addedTo.has(playlist.id)}
							{@const isAdding = addingTo === playlist.id}
							<button
								onclick={() => addToPlaylist(playlist.id)}
								disabled={isAdded || isAdding}
								class="group flex items-center gap-3 rounded-xl p-3 text-left transition-all
									{isAdded
									? 'border border-emerald-500/20 bg-emerald-500/10'
									: 'border border-transparent bg-surface-1/50 hover:bg-surface-1'}"
							>
								<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2">
									{#if playlist.coverUrl}
										<img
											src={playlist.coverUrl}
											alt={playlist.title}
											class="h-full w-full object-cover"
										/>
									{:else}
										<div class="flex h-full w-full items-center justify-center text-text-muted">
											<ListMusic class="h-5 w-5" />
										</div>
									{/if}
								</div>

								<div class="min-w-0 flex-1">
									<p
										class="truncate font-bold text-white {isAdded
											? 'text-emerald-400'
											: 'group-hover:text-accent'}"
									>
										{playlist.title}
									</p>
									<p class="text-xs text-text-muted">
										{getTrackCount(playlist)} tracks
									</p>
								</div>

								<div
									class="flex h-8 w-8 items-center justify-center rounded-full
									{isAdded
										? 'bg-emerald-500/20 text-emerald-400'
										: 'bg-surface-2 text-text-muted group-hover:bg-accent group-hover:text-surface-0'}"
								>
									{#if isAdding}
										<Loader2 class="h-4 w-4 animate-spin" />
									{:else if isAdded}
										<Check class="h-4 w-4" strokeWidth={3} />
									{:else}
										<Plus class="h-4 w-4" />
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
