<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { ListMusic, Plus } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { clientApi } from '$lib/api';
	import type { Playlist, SongRequest } from '$lib/types';
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import RequestCard from '$lib/components/ui/RequestCard.svelte';

	$effect(() => {
		if (auth.isInitialized && !auth.user) {
			goto('/login');
		}
	});

	let playlists = $state<Playlist[]>([]);
	let requests = $state<SongRequest[]>([]);
	let loadingData = $state(true);

	onMount(async () => {
		try {
			const [playlistsData, requestsData] = await Promise.all([
				clientApi.getMyPlaylists(),
				clientApi.getMyRequests()
			]);
			playlists = playlistsData;
			requests = requestsData;
		} catch (e) {
			console.error('Failed to load profile data', e);
		} finally {
			loadingData = false;
		}
	});

	const user = $derived(auth.user);
</script>

{#if user}
	<div class="fade-in flex flex-col gap-10 pb-20">
		<div class="flex flex-row items-center gap-4 py-6 text-left md:items-end md:gap-6">
			<div
				class="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-surface-1 shadow-lg md:h-32 md:w-32 md:border-4"
			>
				{#if user.avatar_url || user.avatarUrl}
					<img
						src={user.avatar_url || user.avatarUrl}
						alt={user.username}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center bg-surface-2 text-2xl font-bold text-text-primary md:text-4xl"
					>
						{user.username[0].toUpperCase()}
					</div>
				{/if}
			</div>

			<div class="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1">
				<h1 class="truncate text-lg font-bold text-text-primary md:text-2xl">
					{user.name || user.displayName || user.username}
				</h1>
				<p class="truncate text-xs font-medium text-text-secondary md:text-sm">
					@{user.username}
				</p>

				<div class="mt-2 flex flex-wrap justify-start gap-2">
					<Button
						variant="outline"
						size="xs"
						onclick={() => auth.logout()}
						class="-ml-0.5 border-red-500/20 !text-[11px] font-bold tracking-tight text-red-400 hover:bg-red-500/10"
					>
						Logout
					</Button>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<div class="flex flex-col gap-6">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-bold text-text-primary md:text-lg">Your Playlists</h2>
					<Button variant="glass" size="xs" href="/library/playlists" class="gap-1.5 md:gap-2">
						<Plus class="h-3.5 w-3.5 md:h-4 md:w-4" /> <span class="md:inline">Create New</span>
					</Button>
				</div>

				{#if loadingData}
					<LoadingSpinner size="md" />
				{:else if playlists.length > 0}
					<div class="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
						{#each playlists as playlist}
							<a
								href="/playlist/{playlist.id}"
								class="group relative flex flex-row items-center gap-3 rounded-xl border border-white/5 bg-surface-1/30 p-2 transition-all hover:border-white/10 hover:bg-surface-1 md:flex-col md:items-stretch md:gap-3 md:rounded-2xl md:p-3"
							>
								<div
									class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-2 shadow-lg md:aspect-square md:h-auto md:w-full md:rounded-xl"
								>
									{#if playlist.coverUrl}
										<img
											src={playlist.coverUrl}
											alt={playlist.title}
											class="h-full w-full object-cover transition-transform duration-500"
										/>
									{:else}
										<div class="flex h-full w-full items-center justify-center text-text-muted">
											<ListMusic class="h-6 w-6 md:h-10 md:w-10" />
										</div>
									{/if}
								</div>
								<div class="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1 md:px-1">
									<p
										class="truncate text-sm font-bold text-text-primary group-hover:text-accent md:text-base"
									>
										{playlist.title}
									</p>
									<p class="text-xs text-text-secondary">
										{(playlist as any).total_tracks || playlist.trackCount || 0} tracks
									</p>
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-surface-1/10 py-10 text-center"
					>
						<p class="text-sm text-text-secondary">No playlists yet</p>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-6">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-bold text-text-primary md:text-lg">Your Requests</h2>
					<Button variant="glass" size="xs" href="/request" class="gap-1.5 md:gap-2">
						<Plus class="h-3.5 w-3.5 md:h-4 md:w-4" /> <span class="md:inline">Request</span>
					</Button>
				</div>

				{#if loadingData}
					<LoadingSpinner size="md" />
				{:else if requests.length > 0}
					<div class="flex flex-col gap-4">
						{#each requests as req}
							<RequestCard request={req} />
						{/each}
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-surface-1/10 py-10 text-center"
					>
						<p class="text-sm text-text-secondary">No requests yet</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<LoadingSpinner fullScreen={true} size="lg" />
{/if}
