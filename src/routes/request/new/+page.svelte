<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Check, X, Send, Link2, HelpCircle, Info } from '@lucide/svelte';
	import { clientApi } from '$lib/api';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let step = $state<'form' | 'success'>('form');
	let loading = $state(false);
	let error = $state('');
	let formData = $state({
		query: '',
		reason: '',
		genre: '',
		source_url: ''
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await clientApi.createRequest({
				query: formData.query,
				metadata: {
					note: formData.reason,
					genre: formData.genre,
					source_url: formData.source_url
				}
			});
			step = 'success';
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Gagal mengirim permintaan. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Add Song Request | Lament</title>
</svelte:head>

<div class="mx-auto max-w-lg pt-12 pb-20 md:pt-24">
	{#if step === 'form'}
		<form
			in:fly={{ y: 20, duration: 400 }}
			onsubmit={handleSubmit}
			class="glass space-y-6 rounded-3xl border border-white/5 p-8"
		>
			<div class="space-y-2 text-left">
				<h1 class="text-xl font-bold tracking-tight uppercase">Song Request</h1>
				<p class="max-w-xs text-[10px] leading-relaxed text-text-secondary">
					Songs are processed manually to ensure quality. Availability is not guaranteed.
				</p>
			</div>

			{#if error}
				<div
					class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-left text-xs text-red-400"
				>
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<div class="group space-y-1">
					<label
						for="query"
						class="px-1 text-[10px] font-bold tracking-wider text-text-secondary uppercase"
						>Song Title / Artist</label
					>
					<div class="relative">
						<Input
							type="text"
							id="query"
							bind:value={formData.query}
							required
							placeholder="Hindia - Secukupnya"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="group space-y-1">
						<label
							for="genre"
							class="px-1 text-[10px] font-bold tracking-wider text-text-secondary uppercase"
							>Genre</label
						>
						<div class="relative">
							<div
								class="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-text-muted"
							>
								<Info class="h-3.5 w-3.5" />
							</div>
							<Input
								type="text"
								id="genre"
								bind:value={formData.genre}
								placeholder="Pop / Rock / JKT48"
								class="pl-9"
							/>
						</div>
					</div>

					<div class="group space-y-1">
						<label
							for="source"
							class="px-1 text-[10px] font-bold tracking-wider text-text-secondary uppercase"
							>Source Link (URL)</label
						>
						<div class="relative">
							<div
								class="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-text-muted"
							>
								<Link2 class="h-3.5 w-3.5" />
							</div>
							<Input
								type="url"
								id="source"
								bind:value={formData.source_url}
								placeholder="https://youtube.com/..."
								class="pl-9"
							/>
						</div>
					</div>
				</div>

				<div class="group space-y-1">
					<label
						for="reason"
						class="px-1 text-[10px] font-bold tracking-wider text-text-secondary uppercase"
						>Notes (Optional)</label
					>
					<div class="relative">
						<div class="pointer-events-none absolute top-3.5 left-3 text-text-muted">
							<HelpCircle class="h-3.5 w-3.5" />
						</div>
						<textarea
							id="reason"
							bind:value={formData.reason}
							rows="3"
							placeholder="Add any additional details..."
							class="w-full resize-none rounded-xl border border-white/10 bg-surface-1 py-3 pr-4 pl-9 text-sm text-white transition-all outline-none placeholder:text-text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:outline-none"
							style="outline: none !important;"
						></textarea>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-between pt-4">
				<a
					href="/request"
					class="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
					aria-label="Cancel"
				>
					<X class="h-5 w-5" strokeWidth={2} />
				</a>

				<Button
					type="submit"
					variant="primary"
					size="md"
					class="rounded-xl px-8 font-bold"
					{loading}
				>
					<span class="flex items-center gap-2">
						Submit <Send class="h-4 w-4" strokeWidth={2.5} />
					</span>
				</Button>
			</div>
		</form>
	{:else}
		<div
			in:fly={{ y: 20, duration: 400 }}
			class="glass flex flex-col items-start gap-6 rounded-3xl border border-white/5 p-10 text-left"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/20"
			>
				<Check class="h-6 w-6" strokeWidth={3} />
			</div>
			<div class="space-y-3">
				<h2 class="text-xl font-bold tracking-tight text-white uppercase">Request Received</h2>
				<p class="max-w-xs text-xs leading-relaxed text-text-secondary">
					We've received your request for <span class="font-bold text-white"
						>{formData.query}</span
					>. We'll get to it soon!
				</p>
			</div>
			<div class="flex w-full flex-col gap-3">
				<Button variant="primary" size="md" href="/request" class="w-full rounded-xl font-bold">
					View All Requests
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="text-xs text-text-muted hover:text-white"
					onclick={() => {
						step = 'form';
						formData = { query: '', reason: '', genre: '', source_url: '' };
					}}
				>
					Request Another
				</Button>
			</div>
		</div>
	{/if}
</div>
