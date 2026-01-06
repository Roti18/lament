<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
	import { fade } from 'svelte/transition';
	import Logo from '$lib/components/ui/Logo.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let infoMessage = $state('');
	let loading = $state(false);
	let mounted = $state(false);
	let redirectTo = $state('/');

	onMount(() => {
		mounted = true;
		const params = new URLSearchParams(window.location.search);
		const reason = params.get('reason');
		const redirect = params.get('redirectTo');

		if (redirect) redirectTo = redirect;

		if (reason === 'login_required') {
			infoMessage = 'You need to log in or create an account to access this feature.';
		}

		const script = document.createElement('script');
		script.src = 'https://accounts.google.com/gsi/client?hl=en';
		script.async = true;
		script.defer = true;
		script.onload = () => initGoogle();
		document.head.appendChild(script);

		const handleResize = () => {
			if (googleInitialized) {
				const container = document.getElementById('google-button-container');
				if (container) {
					google.accounts.id.renderButton(container, {
						theme: 'outline',
						size: 'large',
						width: container.offsetWidth,
						text: 'continue_with',
						shape: 'pill'
					});
				}
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			await auth.login({ login: email, password });
			window.location.href = redirectTo;
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Invalid email or password. Please try again.';
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
						window.location.href = redirectTo;
					} catch (err: any) {
						console.error('Google Auth Error:', err);
						error = 'Google login failed: ' + (err.message || 'Unknown error');
						loading = false;
					}
				}
			},
			auto_select: false,
			context: 'signin'
		});

		const container = document.getElementById('google-button-container');
		if (container) {
			google.accounts.id.renderButton(container, {
				theme: 'outline',
				size: 'large',
				width: container.offsetWidth || 336,
				text: 'continue_with',
				shape: 'pill'
			});
		}

		googleInitialized = true;
	}
</script>

<svelte:head>
	<title>Sign In | Lament</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg">
	<div class="absolute inset-0 bg-gradient-to-br from-accent/20 via-bg to-bg"></div>

	{#if mounted}
		<div
			transition:fade={{ duration: 400 }}
			class="glass relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-surface-2 p-10 py-14 shadow-2xl backdrop-blur-3xl"
		>
			<div class="mb-10 text-center">
				<a
					href="/"
					class="mb-6 inline-flex items-center justify-center text-[#E8A39A] transition-transform hover:scale-105"
				>
					<Logo size="48px" />
				</a>
				<h1
					class="mb-2 text-4xl font-bold tracking-tight text-text-primary"
					style="font-family: 'Cormorant Garamond', serif;"
				>
					Welcome Back
				</h1>
				<p class="text-sm text-text-secondary">Sign in to continue your journey</p>
			</div>

			{#if infoMessage}
				<div
					transition:fade
					class="mb-6 rounded-xl border border-accent/20 bg-accent/10 p-4 text-center text-sm text-accent"
				>
					{infoMessage}
				</div>
			{/if}

			{#if error}
				<div
					transition:fade
					class="mb-6 rounded-xl border border-error/20 bg-error/10 p-4 text-center text-sm text-error"
				>
					{error}
				</div>
			{/if}

			<div class="flex flex-col gap-6">
				<div class="flex flex-col gap-4">
					<div
						id="google-button-container"
						class="min-h-[44px] w-full overflow-hidden rounded-full border border-surface-3"
					></div>

					<div class="relative flex items-center py-2">
						<div class="grow border-t border-surface-2"></div>
						<span class="mx-4 text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase"
							>Or continue with email</span
						>
						<div class="grow border-t border-surface-2"></div>
					</div>
				</div>

				<form onsubmit={handleSubmit} class="flex flex-col gap-5">
					<div class="group">
						<label
							for="email"
							class="mb-2 block text-[10px] font-bold tracking-widest text-text-muted uppercase"
							>Email Address</label
						>
						<Input
							type="email"
							id="email"
							bind:value={email}
							required
							placeholder="seraph@lament.io"
						/>
					</div>
					<div class="group">
						<label
							for="password"
							class="mb-2 block text-[10px] font-bold tracking-widest text-text-muted uppercase"
							>Password</label
						>
						<Input
							type="password"
							id="password"
							bind:value={password}
							required
							placeholder="••••••••"
						/>
					</div>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						class="mt-4 w-full"
						style="border: 2px solid rgba(255, 255, 255, 0.4) !important;"
						{loading}
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>
			</div>

			<p class="mt-10 text-center text-sm text-text-secondary">
				Don't have an account? <a
					href="/register{redirectTo !== '/' ? `?redirectTo=${redirectTo}` : ''}"
					class="font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
					>Create account</a
				>
			</p>
		</div>
	{/if}
</div>

<style>
	.glass {
		background: var(--color-surface-0);
	}
	@supports (backdrop-filter: blur(1px)) {
		.glass {
			background: rgba(var(--color-bg), 0.8);
			backdrop-filter: blur(24px) saturate(1.4);
		}
	}
</style>
