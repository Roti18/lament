<script lang="ts">
	import { Clock, CheckCircle2, XCircle, Link2, Info, Music2 } from '@lucide/svelte';
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
		pending: {
			icon: Clock,
			class: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
			label: 'Pending',
			glow: 'shadow-amber-400/5'
		},
		completed: {
			icon: CheckCircle2,
			class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
			label: 'Done',
			glow: 'shadow-emerald-400/5'
		},
		rejected: {
			icon: XCircle,
			class: 'text-red-400 bg-red-400/10 border-red-400/20',
			label: 'Rejected',
			glow: 'shadow-red-400/5'
		}
	};

	const config = $derived(
		statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending
	);
</script>

<div
	in:fade={{ duration: 300 }}
	class="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-1/30 p-5 transition-all duration-300 hover:border-white/10 hover:bg-surface-1/50 hover:shadow-2xl {config.glow}"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center gap-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-accent transition-transform group-hover:scale-110"
				>
					<Music2 class="h-4.5 w-4.5" />
				</div>
				<h3
					class="truncate text-base font-bold text-text-primary transition-colors group-hover:text-accent"
				>
					{request.query}
				</h3>
			</div>

			<div class="mt-1 flex flex-wrap items-center gap-2">
				{#if metadata.genre || metadata.version}
					<span
						class="flex items-center gap-1 rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-tight text-white/50 uppercase"
					>
						<Info class="h-3 w-3" />
						{metadata.genre || metadata.version}
					</span>
				{/if}
				<span class="text-[10px] font-medium tracking-wider text-text-muted uppercase">
					{new Date(request.created_at).toLocaleDateString(undefined, {
						day: 'numeric',
						month: 'short',
						year: 'numeric'
					})}
				</span>
			</div>
		</div>

		<span
			class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all {config.class}"
		>
			<config.icon class="h-3 w-3" strokeWidth={3} />
			{config.label}
		</span>
	</div>

	{#if metadata.note || metadata.reason}
		<div
			class="relative rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors group-hover:bg-white/[0.04]"
		>
			<p class="line-clamp-2 text-xs leading-relaxed text-text-secondary italic">
				"{metadata.note || metadata.reason}"
			</p>
		</div>
	{/if}

	{#if metadata.source_url}
		<a
			href={metadata.source_url}
			target="_blank"
			rel="noopener noreferrer"
			class="flex w-fit items-center gap-2 rounded-lg bg-accent/5 px-3 py-1.5 text-[10px] font-bold text-accent transition-all hover:scale-105 hover:bg-accent/10 active:scale-95"
		>
			<Link2 class="h-3.5 w-3.5" />
			VIEW SOURCE
		</a>
	{/if}
</div>
