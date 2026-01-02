<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			await auth.register({ username, email, password });
			goto('/');
		} catch (err: any) {
			console.error(err);
			error = 'Registration failed. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleGoogleLogin() {
		if (typeof google === 'undefined') {
			error = 'Google Sign-In not loaded.';
			return;
		}

		// @ts-ignore
		google.accounts.id.initialize({
			client_id: PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
			callback: async (response: any) => {
				if (response.credential) {
					try {
						loading = true;
						await auth.loginWithGoogle(response.credential);
						goto('/');
					} catch (err) {
						console.error(err);
						error = 'Google login failed';
						loading = false;
					}
				}
			}
		});

		// @ts-ignore
		google.accounts.id.prompt((notification: any) => {
			if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
				console.log('One Tap skipped or not displayed');
			}
		});
	}

	onMount(() => {
		// Load Google Script if not loaded
		if (!document.getElementById('gsi-script')) {
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.id = 'gsi-script';
			script.async = true;
			script.defer = true;
			document.body.appendChild(script);
		}
	});
</script>

<div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg">
	<!-- Background decorations -->
	<div
		class="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[128px] transition-all duration-1000 ease-in-out"
	></div>
	<div
		class="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-[96px] transition-all duration-1000 ease-in-out"
	></div>
	<div
		class="absolute right-1/3 -bottom-32 h-64 w-64 rounded-full bg-accent/10 blur-[80px] transition-all duration-1000 ease-in-out"
	></div>

	<!-- Register Card -->
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
				Create Account
			</h1>
			<p class="text-sm text-text-secondary">Join Lament providing the best music experience</p>
		</div>

		{#if error}
			<div
				class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400"
			>
				{error}
			</div>
		{/if}

		<div class="flex flex-col gap-4">
			<Button variant="glass" size="lg" class="w-full gap-3" onclick={handleGoogleLogin}>
				<svg class="h-5 w-5" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						style="fill: #4285F4;"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						style="fill: #34A853;"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						style="fill: #FBBC05;"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						style="fill: #EA4335;"
					/>
				</svg>
				Continue with Google
			</Button>

			<div class="relative flex items-center py-2">
				<div class="grow border-t border-white/10"></div>
				<span class="mx-4 text-xs text-text-muted uppercase">Or with email</span>
				<div class="grow border-t border-white/10"></div>
			</div>

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<div class="group">
					<label
						for="username"
						class="mb-1.5 block text-xs font-medium tracking-wider text-text-secondary uppercase"
						>Username</label
					>
					<input
						type="text"
						id="username"
						bind:value={username}
						required
						class="w-full rounded-xl border border-white/10 bg-surface-1/50 px-4 py-3 text-text-primary placeholder-text-muted transition-all outline-none focus:border-accent/50 focus:bg-surface-1 focus:ring-1 focus:ring-accent/50"
						placeholder="Choose a username"
					/>
				</div>
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
						class="w-full rounded-xl border border-white/10 bg-surface-1/50 px-4 py-3 text-white placeholder-text-muted transition-all outline-none focus:border-accent/50 focus:bg-surface-1 focus:ring-1 focus:ring-accent/50"
						placeholder="Enter your email"
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
						class="w-full rounded-xl border border-white/10 bg-surface-1/50 px-4 py-3 text-white placeholder-text-muted transition-all outline-none focus:border-accent/50 focus:bg-surface-1 focus:ring-1 focus:ring-accent/50"
						placeholder="Create a password"
					/>
				</div>

				<Button type="submit" variant="primary" size="lg" class="mt-2 w-full" {loading}>
					Register
				</Button>
			</form>
		</div>

		<p class="mt-8 text-center text-sm text-text-secondary">
			Already have an account? <a
				href="/login"
				class="font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
				>Sign In</a
			>
		</p>
	</div>
</div>
