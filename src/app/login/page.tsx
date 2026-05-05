'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function LoginPage() {
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [showPassword, setShowPassword] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);

		if (!email || !password) {
			setError('Please enter your email and password.');
			return;
		}

		setSubmitting(true);
		await new Promise((r) => setTimeout(r, 1200));
		setSubmitting(false);
	}

	return (
		<div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
			/>

			<div className="w-full max-w-sm">
				<div className="mb-6 flex flex-col items-center gap-2 text-center">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
						<LogIn className="size-5" />
					</div>
					<h1 className="text-lg font-semibold tracking-tight">Welcome back to Nexus</h1>
					<p className="text-sm text-muted-foreground">Sign in to manage your subscriptions.</p>
				</div>

				<Card className="border-border/70 shadow-sm">
					<CardHeader className="space-y-1">
						<CardTitle className="text-base">Sign in</CardTitle>
						<CardDescription>Enter your credentials to continue.</CardDescription>
					</CardHeader>

					<form onSubmit={onSubmit} noValidate>
						<CardContent className="space-y-4 pb-4">
							<div className="space-y-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="you@sandboxgroup.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									aria-invalid={!!error && !email}
									disabled={submitting}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									<Link
										href="/forgot-password"
										className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
									>
										Forgot password?
									</Link>
								</div>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										autoComplete="current-password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										aria-invalid={!!error && !password}
										disabled={submitting}
										className="pr-9"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										tabIndex={submitting ? -1 : 0}
									>
										{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>
							</div>

							{error && (
								<p
									role="alert"
									className={cn(
										'rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive'
									)}
								>
									{error}
								</p>
							)}

							<div className="flex flex-col gap-3 pt-1">
								<Button type="submit" size="lg" className="w-full" disabled={submitting}>
									{submitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Signing in…
										</>
									) : (
										'Login'
									)}
								</Button>
								<p className="text-center text-xs text-muted-foreground">
									Don&apos;t have an account?{' '}
									<Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
										Create one
									</Link>
								</p>
							</div>
						</CardContent>
					</form>
				</Card>

				<p className="mt-6 text-center text-xs text-muted-foreground">
					By continuing, you agree to Nexus&apos;s{' '}
					<Link href="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
						Terms
					</Link>{' '}
					and{' '}
					<Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
}
