<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { clientApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { Plus, Music2, Edit, Trash2 } from 'lucide-svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Playlist } from '$lib/types';
	import { fade } from 'svelte/transition';

	let playlists = $state<Playlist[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

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

	function getModalTitle() {
		switch (modalMode) {
			case 'create':
				return 'Create Playlist';
			case 'edit':
				return 'Edit Playlist';
			case 'delete':
				return 'Delete Playlist';
		}
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
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col gap-6 pb-24">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-primary">Your Library</h1>
			<p class="mt-1 text-text-secondary">Manage your personal playlists</p>
		</div>
		<Button onclick={openCreateModal} class="rounded-full font-bold">
			<Plus class="mr-2 h-4 w-4" /> Create Playlist
		</Button>
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
			<Button onclick={loadPlaylists} variant="ghost" class="mt-4 font-semibold underline"
				>Retry</Button
			>
		</div>
	{:else if playlists.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-surface-1 py-24 text-center"
		>
			<div class="rounded-full bg-surface-2 p-6">
				<Music2 class="h-10 w-10 text-text-secondary" />
			</div>
			<div>
				<h3 class="text-lg font-bold text-text-primary">No playlists yet</h3>
				<p class="mt-2 max-w-xs text-text-secondary">
					Create your first playlist and start collecting your favorite tracks.
				</p>
			</div>
			<Button onclick={openCreateModal} variant="secondary" class="mt-4">Create Playlist</Button>
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
								class="h-full w-full object-cover transition-transform duration-500"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-surface-3">
								<Music2 class="h-12 w-12 text-white/20" />
							</div>
						{/if}

						<div
							class="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
						>
							<Button
								onclick={() => openEditModal(playlist)}
								variant="glass"
								size="icon"
								class="rounded-full"
								title="Edit"
							>
								<Edit class="h-4 w-4" />
							</Button>
							<Button
								onclick={() => openDeleteModal(playlist)}
								variant="danger"
								size="icon"
								class="rounded-full"
								title="Delete"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div>
						<h3 class="truncate font-bold text-text-primary">{playlist.title}</h3>
						<p class="truncate text-sm text-text-secondary">
							{playlist.trackCount} tracks
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:open={showModal} title={getModalTitle()} onclose={closeModal}>
	{#if modalMode === 'delete'}
		<p class="mb-6 text-text-secondary">
			Are you sure you want to delete <b class="text-text-primary">{selectedPlaylist?.title}</b>?
			This action cannot be undone.
		</p>
		<div class="flex justify-end gap-3">
			<Button variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button
				variant="primary"
				onclick={handleSubmit}
				loading={submitting}
				class="border-red-500/20 bg-red-500 hover:bg-red-600"
			>
				{submitting ? 'Deleting...' : 'Delete Playlist'}
			</Button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div>
				<label for="title" class="mb-1 block text-sm font-medium text-text-secondary"
					>Playlist Title</label
				>
				<Input
					type="text"
					id="title"
					bind:value={formTitle}
					required
					placeholder="My Awesome Playlist"
				/>
			</div>
			<div>
				<label for="desc" class="mb-1 block text-sm font-medium text-text-secondary"
					>Description <span class="text-text-muted">(Optional)</span></label
				>
				<textarea
					id="desc"
					bind:value={formDescription}
					rows="3"
					placeholder="Add a description..."
					class="w-full resize-none rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-text-primary transition-all outline-none placeholder:text-text-muted focus:border-accent/50 focus:shadow-none focus:ring-1 focus:ring-accent/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:outline-none"
					style="outline: none !important;"
				></textarea>
			</div>
			<div class="mt-2 flex justify-end gap-5">
				<Button variant="ghost" type="button" onclick={closeModal}>Cancel</Button>
				<Button type="submit" variant="primary" loading={submitting}>
					{submitting ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
				</Button>
			</div>
		</form>
	{/if}
</Modal>
