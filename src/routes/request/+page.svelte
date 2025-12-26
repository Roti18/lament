<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Check, X, ArrowRight, ArrowLeft, Send, Home } from '@lucide/svelte';

	let step = $state<'intro' | 'form' | 'success'>('intro');
	let formData = $state({
		title: '',
		artist: '',
		link: '',
		note: ''
	});

	function handleContinue() {
		step = 'form';
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		setTimeout(() => {
			step = 'success';
		}, 500);
	}
</script>

<svelte:head>
	<title>Request Song | lament</title>
</svelte:head>

<div class="mx-auto max-w-lg pt-12 md:pt-24">
	{#if step === 'intro'}
		<div in:fly={{ y: 20, duration: 400 }} class="glass space-y-6 rounded-2xl p-8 text-center">
			<div class="space-y-2">
				<h1 class="text-xl font-medium text-text-primary">Request a song</h1>
				<p class="text-sm leading-relaxed text-balance text-text-secondary">
					Song requests are processed manually to ensure quality. Availability is not guaranteed.
				</p>
			</div>

			<div class="flex items-center justify-center gap-6 pt-4">
				<a
					href="/"
					class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-secondary transition-all hover:scale-105 hover:bg-surface-3 hover:text-text-primary"
					aria-label="Cancel"
				>
					<X class="h-5 w-5" strokeWidth={2} />
				</a>
				<button
					onclick={handleContinue}
					class="flex h-14 w-14 items-center justify-center rounded-full bg-text-primary text-surface-0 shadow-lg transition-transform hover:scale-105 active:scale-95"
					aria-label="Continue"
				>
					<ArrowRight class="h-6 w-6" strokeWidth={2} />
				</button>
			</div>
		</div>
	{:else if step === 'form'}
		<form
			in:fly={{ y: 20, duration: 400 }}
			onsubmit={handleSubmit}
			class="glass space-y-6 rounded-2xl p-8"
		>
			<div class="space-y-1 text-center">
				<h2 class="text-lg font-medium text-text-primary">Song Details</h2>
			</div>

			<div class="space-y-4">
				<div class="space-y-1.5">
					<input
						type="text"
						id="title"
						bind:value={formData.title}
						required
						placeholder="Song Title (required)"
						class="w-full rounded-lg border border-surface-3 bg-surface-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
					/>
				</div>

				<div class="space-y-1.5">
					<input
						type="text"
						id="artist"
						bind:value={formData.artist}
						placeholder="Artist Name"
						class="w-full rounded-lg border border-surface-3 bg-surface-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
					/>
				</div>

				<div class="space-y-1.5">
					<input
						type="url"
						id="link"
						bind:value={formData.link}
						placeholder="Link (Spotify/YouTube)"
						class="w-full rounded-lg border border-surface-3 bg-surface-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
					/>
				</div>

				<div class="space-y-1.5">
					<textarea
						bind:value={formData.note}
						rows="2"
						placeholder="Notes (optional)"
						class="w-full resize-none rounded-lg border border-surface-3 bg-surface-1 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
					></textarea>
				</div>
			</div>

			<div class="flex items-center justify-between pt-4">
				<button
					type="button"
					onclick={() => (step = 'intro')}
					class="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
					aria-label="Back"
				>
					<ArrowLeft class="h-5 w-5" strokeWidth={2} />
				</button>
				<button
					type="submit"
					class="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-surface-0 shadow-lg transition-all hover:scale-105 hover:bg-accent-hover active:scale-95"
					aria-label="Submit Request"
				>
					<Send class="h-5 w-5 translate-x-0.5" strokeWidth={2} />
				</button>
			</div>
		</form>
	{:else}
		<div
			in:fly={{ y: 20, duration: 400 }}
			class="glass flex flex-col items-center gap-6 rounded-2xl p-12 text-center"
		>
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-success"
			>
				<Check class="h-8 w-8" strokeWidth={3} />
			</div>
			<div class="space-y-2">
				<h2 class="text-lg font-medium text-text-primary">Request Received</h2>
			</div>
			<a
				href="/"
				class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-primary transition-all hover:scale-105 hover:bg-surface-3"
				aria-label="Return Home"
			>
				<Home class="h-5 w-5" strokeWidth={2} />
			</a>
		</div>
	{/if}
</div>
