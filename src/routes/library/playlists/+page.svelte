<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { clientApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { Plus, Music2, Edit, Trash2, X, Check } from 'lucide-svelte';
	import type { Playlist } from '$lib/types';
	import { fade, scale } from 'svelte/transition';

	let playlists = $state<Playlist[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Modal State
	let showModal = $state(false);
	let modalMode = $state<'create' | 'edit' | 'delete'>('create');
	let selectedPlaylist = $state<Playlist | null>(null);
	let formTitle = $state('');
	let formDescription = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (auth.isInitialized) {
			if (!auth.user) {
				goto('/login');
			} else {
				loadPlaylists();
			}
		}
	});

	async function loadPlaylists() {
		try {
			loading = true;
			playlists = await clientApi.getMyPlaylists();
		} catch (e) {
			console.error(e);
			error = 'Failed to load playlists';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		modalMode = 'create';
		formTitle = '';
		formDescription = '';
		selectedPlaylist = null;
		showModal = true;
	}

	function openEditModal(playlist: Playlist) {
		modalMode = 'edit';
		formTitle = playlist.title;
		formDescription = playlist.description || '';
		selectedPlaylist = playlist;
		showModal = true;
	}

	function openDeleteModal(playlist: Playlist) {
		modalMode = 'delete';
		selectedPlaylist = playlist;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		selectedPlaylist = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;

		try {
			if (modalMode === 'create') {
				await clientApi.createPlaylist({ title: formTitle, description: formDescription });
				await loadPlaylists();
				closeModal();
			} else if (modalMode === 'edit' && selectedPlaylist) {
				await clientApi.updatePlaylist(selectedPlaylist.id, {
					title: formTitle,
					description: formDescription
				});
				await loadPlaylists();
				closeModal();
			} else if (modalMode === 'delete' && selectedPlaylist) {
				await clientApi.deletePlaylist(selectedPlaylist.id);
				await loadPlaylists();
				closeModal();
			}
		} catch (err) {
			console.error(err);
			// handle error
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col gap-6 pb-24">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Your Library</h1>
			<p class="mt-1 text-text-secondary">Manage your personal playlists</p>
		</div>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
		>
			<Plus class="h-4 w-4" /> Create Playlist
		</button>
	</div>

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-surface-2 border-t-accent"
			></div>
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
			<p>{error}</p>
			<button onclick={loadPlaylists} class="mt-4 font-semibold text-white underline">Retry</button>
		</div>
	{:else if playlists.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-surface-1 py-24 text-center"
		>
			<div class="rounded-full bg-surface-2 p-6">
				<Music2 class="h-10 w-10 text-text-secondary" />
			</div>
			<div>
				<h3 class="text-xl font-bold text-white">No playlists yet</h3>
				<p class="mt-2 max-w-xs text-text-secondary">
					Create your first playlist and start collecting your favorite tracks.
				</p>
			</div>
			<button
				onclick={openCreateModal}
				class="mt-4 rounded-full bg-white px-6 py-2 font-bold text-black transition-transform hover:scale-105"
			>
				Create Playlist
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each playlists as playlist}
				<div
					class="group relative flex flex-col gap-3 rounded-xl bg-surface-1 p-4 transition-all hover:bg-surface-2"
				>
					<div class="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
						{#if playlist.coverUrl}
							<img
								src={playlist.coverUrl}
								alt={playlist.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-surface-3">
								<Music2 class="h-12 w-12 text-white/20" />
							</div>
						{/if}

						<!-- Overlay Actions -->
						<div
							class="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
						>
							<button
								onclick={() => openEditModal(playlist)}
								class="rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/20"
								title="Edit"
							>
								<Edit class="h-4 w-4" />
							</button>
							<button
								onclick={() => openDeleteModal(playlist)}
								class="rounded-full bg-red-500/20 p-2 text-red-400 backdrop-blur-md hover:bg-red-500/40"
								title="Delete"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
					<div>
						<h3 class="truncate font-bold text-white">{playlist.title}</h3>
						<p class="truncate text-sm text-text-secondary">
							{playlist.trackCount} tracks
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-2xl"
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			<!-- Modal Header -->
			<div
				class="flex items-center justify-between border-b border-white/5 bg-surface-3/50 px-6 py-4"
			>
				<h2 class="text-xl font-bold text-white">
					{modalMode === 'create'
						? 'Create Playlist'
						: modalMode === 'edit'
							? 'Edit Playlist'
							: 'Delete Playlist'}
				</h2>
				<button onclick={closeModal} class="text-text-secondary transition-colors hover:text-white">
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Modal Content -->
			<div class="p-6">
				{#if modalMode === 'delete'}
					<p class="mb-6 text-text-secondary">
						Are you sure you want to delete <b class="text-white">{selectedPlaylist?.title}</b>?
						This action cannot be undone.
					</p>
					<div class="flex justify-end gap-3">
						<button
							onclick={closeModal}
							class="rounded-lg px-4 py-2 font-medium text-text-secondary transition-colors hover:text-white"
							>Cancel</button
						>
						<button
							onclick={handleSubmit}
							disabled={submitting}
							class="rounded-lg bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
						>
							{submitting ? 'Deleting...' : 'Delete Playlist'}
						</button>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="flex flex-col gap-4">
						<div>
							<label for="title" class="mb-1 block text-sm font-medium text-text-secondary"
								>Title</label
							>
							<input
								type="text"
								id="title"
								bind:value={formTitle}
								required
								placeholder="My Awesome Playlist"
								class="w-full rounded-lg border border-white/5 bg-surface-1 px-4 py-2 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none"
							/>
						</div>
						<div>
							<label for="desc" class="mb-1 block text-sm font-medium text-text-secondary"
								>Description <span class="text-white/20">(Optional)</span></label
							>
							<textarea
								id="desc"
								bind:value={formDescription}
								rows="3"
								placeholder="Add a description..."
								class="w-full resize-none rounded-lg border border-white/5 bg-surface-1 px-4 py-2 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none"
							></textarea>
						</div>
						<div class="mt-2 flex justify-end gap-3">
							<button
								type="button"
								onclick={closeModal}
								class="rounded-lg px-4 py-2 font-medium text-text-secondary transition-colors hover:text-white"
								>Cancel</button
							>
							<button
								type="submit"
								disabled={submitting}
								class="rounded-lg bg-accent px-6 py-2 font-bold text-black transition-colors hover:brightness-110 disabled:opacity-50"
							>
								{submitting ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save Changes'}
							</button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</div>
{/if}
