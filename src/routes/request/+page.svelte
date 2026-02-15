<script lang="ts">
	import { Plus, ArrowUpDown, ChevronDown, Check, Search } from 'lucide-svelte';
	import { clientApi } from '$lib/api';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import RequestCard from '$lib/components/ui/RequestCard.svelte';
	import type { SongRequest } from '$lib/types';
	import { fade, slide } from 'svelte/transition';

	let requests = $state<SongRequest[]>([]);
	let loading = $state(true);
	let sortBy = $state<'newest' | 'oldest' | 'status'>('newest');
	let isSortOpen = $state(false);
	let search = $state('');

	const sortOptions = [
		{ id: 'newest', label: 'Newest' },
		{ id: 'oldest', label: 'Oldest' },
		{ id: 'status', label: 'Status' }
	] as const;

	let filteredAndSortedRequests = $derived.by(() => {
		let result = [...requests];
		
		// Filter
		const q = search.toLowerCase().trim();
		if (q) {
			result = result.filter(r => 
				r.query.toLowerCase().includes(q) || 
				(typeof r.metadata === 'string' ? r.metadata : JSON.stringify(r.metadata)).toLowerCase().includes(q)
			);
		}

		// Sort
		if (sortBy === 'newest') {
			result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		} else if (sortBy === 'oldest') {
			result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
		} else if (sortBy === 'status') {
			result.sort((a, b) => a.status.localeCompare(b.status));
		}
		return result;
	});

	onMount(async () => {
		try {
			requests = await clientApi.getAllRequests();
		} catch (e) {
			console.error('Failed to load requests', e);
		} finally {
			loading = false;
		}
	});

	function handleOutsideClick() {
		if (isSortOpen) isSortOpen = false;
	}
</script>

<svelte:head>
	<title>Requests | Lament</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-12 pb-32">
	<!-- Restored Header Size -->
	<header class="mb-10 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-text-primary">Requests</h1>
			<p class="mt-1 text-sm text-text-secondary">{requests.length} tracks requested</p>
		</div>
		<Button 
			variant="primary" 
			size="md" 
			href="/request/new" 
			class="rounded-xl px-6"
		>
			<Plus class="mr-2 h-4 w-4" strokeWidth={2.5} />
			New Request
		</Button>
	</header>

	<!-- Search & Sort -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
		<div class="relative flex-1 max-w-sm">
			<Search class="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
			<Input 
				type="text" 
				bind:value={search} 
				placeholder="Search requests..." 
				class="h-9 pl-10 text-xs py-0"
			/>
		</div>

		<div class="flex items-center justify-between gap-4">
			<div class="text-[10px] font-bold uppercase tracking-widest text-text-muted">
				{filteredAndSortedRequests.length} results
			</div>

			<div class="relative">
				<button
					onclick={(e) => {
						e.stopPropagation();
						isSortOpen = !isSortOpen;
					}}
					class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
				>
					<ArrowUpDown class="h-3 w-3" />
					<span>Sort: {sortOptions.find((o) => o.id === sortBy)?.label}</span>
					<ChevronDown class="h-3 w-3 transition-transform {isSortOpen ? 'rotate-180' : ''}" />
				</button>

				{#if isSortOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div 
						class="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-white/5 bg-surface-1 p-1 shadow-2xl backdrop-blur-xl"
						transition:slide={{ duration: 150 }}
						onclick={(e) => e.stopPropagation()}
					>
						{#each sortOptions as option}
							<button
								onclick={() => {
									sortBy = option.id;
									isSortOpen = false;
								}}
								class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors {sortBy === option.id ? 'bg-accent text-black' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}"
							>
								{option.label}
								{#if sortBy === option.id}
									<Check class="h-3 w-3" strokeWidth={3} />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex h-40 items-center justify-center">
			<LoadingSpinner size="md" />
		</div>
	{:else if filteredAndSortedRequests.length > 0}
		<div class="grid gap-3" in:fade={{ duration: 200 }}>
			{#each filteredAndSortedRequests as req (req.id)}
				<RequestCard request={req} />
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-1 bg-surface-1/20 py-24">
			<p class="text-sm text-text-muted">{search ? 'No results for "' + search + '"' : 'No requests found'}</p>
		</div>
	{/if}
</div>

{#if isSortOpen}
	<div class="fixed inset-0 z-40" onclick={handleOutsideClick}></div>
{/if}
