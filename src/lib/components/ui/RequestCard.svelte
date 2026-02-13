<script lang="ts">
	import { Share2, Clock, CheckCircle2, XCircle } from '@lucide/svelte';
	import type { SongRequest } from '$lib/types';
	import { fade } from 'svelte/transition';

	let { request } = $props<{ request: SongRequest }>();

	const metadata = $derived.by(() => {
		if (!request.metadata) return {};
		if (typeof request.metadata === 'string') {
			try {
				return JSON.parse(request.metadata);
			} catch {
				return {};
			}
		}
		return request.metadata;
	});

	const statusConfig = {
		pending: { color: 'text-amber-500', bar: 'bg-amber-500', icon: Clock, label: 'Pending' },
		completed: { color: 'text-emerald-500', bar: 'bg-emerald-500', icon: CheckCircle2, label: 'Ready' },
		rejected: { color: 'text-red-500', bar: 'bg-red-500', icon: XCircle, label: 'Declined' }
	};

	const config = $derived(statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending);
</script>

<div
	in:fade={{ duration: 200 }}
	class="group relative overflow-hidden rounded-2xl border border-white/[0.03] bg-surface-1/20 py-5 pl-7 pr-6 transition-all hover:bg-surface-1/40 hover:border-white/10"
>
	<!-- Status Accent Bar -->
	<div class="absolute left-0 top-0 bottom-0 w-1 {config.bar} opacity-40 transition-opacity group-hover:opacity-100"></div>

	<div class="flex items-center justify-between gap-4">
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-3">
				<h3 class="truncate text-[15px] font-bold text-text-primary tracking-tight">
					{request.query}
				</h3>
			</div>
			
			<div class="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
				<span>{metadata.genre || 'General'}</span>
				<span class="h-1 w-1 rounded-full bg-white/5"></span>
				<span>{new Date(request.created_at).toLocaleDateString()}</span>
			</div>
		</div>

		<div class="flex shrink-0 items-center gap-5">
			<div class="flex items-center gap-2">
				<config.icon class="h-3.5 w-3.5 {config.color}" strokeWidth={3} />
				<span class="text-[10px] font-black uppercase tracking-[0.1em] {config.color}">
					{config.label}
				</span>
			</div>

			{#if metadata.source_url}
				<a 
					href={metadata.source_url} 
					target="_blank" 
					class="text-text-muted transition-colors hover:text-accent"
					aria-label="Source Link"
				>
					<Share2 class="h-4 w-4" />
				</a>
			{/if}
		</div>
	</div>
</div>
