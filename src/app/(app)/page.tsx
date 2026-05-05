import { PageHeader } from '@/components/page-header';

export default function DashboardPage() {
	return (
		<>
			<PageHeader crumbs={[{ label: 'Nexus' }, { label: 'Dashboard' }]} />
			<main className="flex flex-1 items-start justify-center bg-muted/40 px-6 py-12">
				<div className="w-full max-w-xl rounded-xl border bg-background p-10 text-center shadow-sm">
					<h1 className="text-base font-semibold">Dashboard is being crafted</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						We&apos;re redesigning this experience from the ground up. The navigation is ready — pages are being built
						one by one.
					</p>
				</div>
			</main>
		</>
	);
}
