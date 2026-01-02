<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			await auth.login({ login: email, password });
			goto('/');
		} catch (err: any) {
			console.error(err);
			error = 'Invalid credentials or server error';
		} finally {
			loading = false;
		}
	}

	let googleInitialized = false;

	function initGoogle() {
		if (typeof google === 'undefined' || googleInitialized) return;

		google.accounts.id.initialize({
			client_id: PUBLIC_GOOGLE_CLIENT_ID,
			callback: async (response: any) => {
				if (response.credential) {
					try {
						loading = true;
						await auth.loginWithGoogle(response.credential);
						goto('/');
					} catch (err) {
						console.error('Google Auth Error:', err);
						error =
							'Google login failed: ' + (err instanceof Error ? err.message : 'Unknown error');
						loading = false;
					}
				}
			},
			auto_select: false,
			context: 'signin'
		});

		// Render the standard button
		const container = document.getElementById('google-button-container');
		if (container) {
			google.accounts.id.renderButton(container, {
				theme: 'outline',
				size: 'large',
				width: 336, // Match the card width mostly
				text: 'continue_with',
				shape: 'pill'
			});
		}

		googleInitialized = true;
	}

	function handleGoogleLogin() {
		if (typeof google === 'undefined') {
			error = 'Google Sign-In script not loaded yet. Please wait a moment.';
			return;
		}

		if (!googleInitialized) initGoogle();

		// Prompt One Tap / Account Picker
		google.accounts.id.prompt((notification: any) => {
			if (notification.isNotDisplayed()) {
				console.warn('One Tap not displayed:', notification.getNotDisplayedReason());
				if (notification.getNotDisplayedReason() === 'opt_out_or_no_session') {
					error = 'Please ensure you are signed in to Google and have not opted out of One Tap.';
				}
			}
			if (notification.isSkippedMoment()) {
				console.warn('One Tap skipped:', notification.getSkippedReason());
			}
		});
	}

	onMount(() => {
		// Load Google Script
		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => initGoogle();
		document.head.appendChild(script);
	});
</script>

<div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg">
	<!-- Background decorations -->
	<div
		class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent/20 blur-[128px] transition-all duration-1000 ease-in-out"
	></div>
	<div
		class="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-secondary/10 blur-[96px] transition-all duration-1000 ease-in-out"
	></div>
	<div
		class="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-accent/10 blur-[80px] transition-all duration-1000 ease-in-out"
	></div>

	<!-- Login Card -->
	<div
		class="glass relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/5 p-8 shadow-2xl backdrop-blur-3xl"
	>
		<div class="mb-8 text-center">
			<a
				href="/"
				class="mb-6 inline-flex h-12 w-12 items-center justify-center text-4xl font-bold tracking-tight text-accent italic transition-transform hover:scale-105"
				style="font-family: 'Cormorant Garamond', serif;"
			>
				L
			</a>
			<h1
				class="mb-2 text-4xl font-bold tracking-tight text-text-primary"
				style="font-family: 'Cormorant Garamond', serif;"
			>
				Welcome Back
			</h1>
			<p class="text-sm text-text-secondary">Sign in to continue to Lament</p>
		</div>

		{#if error}
			<div
				class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400"
			>
				{error}
			</div>
		{/if}

		<div class="flex flex-col gap-4">
			<div id="google-button-container" class="min-h-[44px] w-full"></div>

			<div class="relative flex items-center py-2">
				<div class="grow border-t border-white/10"></div>
				<span class="mx-4 text-xs text-text-muted uppercase">Or with email</span>
				<div class="grow border-t border-white/10"></div>
			</div>

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<div class="group">
					<label
						for="email"
						class="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase"
						>Email</label
					>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full rounded-xl border border-white/10 bg-surface-1/50 px-4 py-3 text-text-primary placeholder-text-muted transition-all outline-none focus:border-accent/50 focus:bg-surface-1 focus:ring-1 focus:ring-accent/50"
						placeholder="name@example.com"
					/>
				</div>
				<div class="group">
					<label
						for="password"
						class="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase"
						>Password</label
					>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full rounded-xl border border-white/10 bg-surface-1/50 px-4 py-3 text-text-primary placeholder-text-muted transition-all outline-none focus:border-accent/50 focus:bg-surface-1 focus:ring-1 focus:ring-accent/50"
						placeholder="Your password"
					/>
				</div>

				<Button type="submit" variant="primary" size="lg" class="mt-2 w-full" {loading}>
					Sign In
				</Button>
			</form>
		</div>

		<p class="mt-8 text-center text-sm text-text-secondary">
			Don't have an account? <a
				href="/register"
				class="font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
				>Register</a
			>
		</p>
	</div>
</div>
