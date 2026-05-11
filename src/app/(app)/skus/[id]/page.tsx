'use client';

import {
	BoxesIcon,
	CalendarClockIcon,
	CheckIcon,
	CoinsIcon,
	GiftIcon,
	HistoryIcon,
	PencilIcon,
	XIcon,
} from 'lucide-react';
import { notFound, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
	SkuFormSections,
	skuToForm,
	type SkuFormValue,
} from '@/components/sku-form-sections';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
	billingLabel,
	formatPrice,
	getBrand,
	getSku,
	trialSummary,
	type Price,
	type PriceVersion,
	type Sku,
} from '@/lib/skus';

type Params = Promise<{ id: string }>;

function formatTimestamp(s: string) {
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return s;
	return d.toLocaleString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

function formatDate(s: string) {
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return s;
	return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SkuDetailPage({ params }: { params: Params }) {
	const { id } = React.use(params);
	const initial = getSku(id);
	if (!initial) notFound();
	const searchParams = useSearchParams();
	const editParam = searchParams.get('edit') === '1';

	const [sku, setSku] = React.useState<Sku>(initial);
	const [editing, setEditing] = React.useState(editParam);
	const [snapshot, setSnapshot] = React.useState<Sku | null>(editParam ? initial : null);
	const [form, setForm] = React.useState<SkuFormValue>(() => skuToForm(initial));

	function startEdit() {
		setSnapshot(sku);
		setForm(skuToForm(sku));
		setEditing(true);
	}
	function saveEdit() {
		setSku((prev) => ({
			...prev,
			skuId: form.skuId,
			name: form.name,
			description: form.description,
			tenantId: form.tenantId,
			billingCycle: form.billingCycle,
			status: form.status,
			prices: form.prices,
			trial:
				form.trialType === 'free_trial'
					? { type: 'free_trial', freeTrialDays: form.freeTrialDays }
					: form.trialType === 'introductory_pricing'
						? {
								type: 'introductory_pricing',
								introPrices: form.introPrices,
								introDurationDays: form.introDurationDays,
							}
						: { type: 'none' },
			updatedAt: new Date().toISOString(),
		}));
		setSnapshot(null);
		setEditing(false);
	}
	function cancelEdit() {
		if (snapshot) setSku(snapshot);
		setSnapshot(null);
		setEditing(false);
	}

	const brand = getBrand(sku.tenantId);

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'SKU Catalog' },
					{ label: 'All SKUs', href: '/skus' },
					{ label: sku.name },
				]}
			/>
			<main className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-col gap-1">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-xl font-semibold tracking-tight">{sku.name}</h1>
							<Badge
								variant="outline"
								className={cn(
									'gap-1.5',
									sku.status === 'active'
										? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
										: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
								)}
							>
								<span
									className="size-1.5 rounded-full"
									style={{ backgroundColor: sku.status === 'active' ? '#00B86E' : '#E8536A' }}
								/>
								{sku.status === 'active' ? 'Active' : 'Inactive'}
							</Badge>
							{brand ? (
								<span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-0.5 text-xs">
									<span
										className="flex size-3.5 items-center justify-center rounded text-[9px] font-semibold text-white"
										style={{ backgroundColor: brand.color }}
									>
										{brand.name[0]}
									</span>
									<span className="font-medium text-foreground">{brand.name}</span>
								</span>
							) : null}
						</div>
						<p className="text-sm text-muted-foreground">
							<span className="font-mono text-foreground">{sku.skuId}</span>
							<span className="mx-2 text-muted-foreground/40">·</span>
							Last Modified:{' '}
							<span className="text-foreground">{formatTimestamp(sku.updatedAt)}</span>
							<span className="mx-2 text-muted-foreground/40">·</span>
							Created: <span className="text-foreground">{formatTimestamp(sku.createdAt)}</span>
						</p>
					</div>
					{editing ? (
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" className="h-9" onClick={cancelEdit}>
								<XIcon />
								Cancel
							</Button>
							<Button
								size="sm"
								className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]"
								onClick={saveEdit}
							>
								<CheckIcon />
								Save
							</Button>
						</div>
					) : (
						<Button
							size="sm"
							className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]"
							onClick={startEdit}
						>
							<PencilIcon />
							Edit
						</Button>
					)}
				</div>

				{editing ? (
					<SkuFormSections value={form} onChange={setForm} />
				) : (
					<div className="flex flex-col gap-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<DetailsReadCard sku={sku} />
							<LifecycleReadCard sku={sku} />
						</div>
						<PricingReadCard sku={sku} />
						<TrialReadCard sku={sku} />
						<HistoryCard versions={sku.versions} />
					</div>
				)}
			</main>
		</>
	);
}

function CardIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
	return (
		<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#224089]/10 text-[#224089]">
			<Icon className="size-4" />
		</span>
	);
}

function Divider() {
	return <div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />;
}

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="text-sm font-medium text-foreground">{children}</span>
		</div>
	);
}

function DetailsReadCard({ sku }: { sku: Sku }) {
	const brand = getBrand(sku.tenantId);
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={BoxesIcon} />
				<CardTitle>Plan Details</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Plan Name">{sku.name}</ReadField>
				<ReadField label="SKU ID">
					<span className="font-mono">{sku.skuId}</span>
				</ReadField>
				<ReadField label="Internal Description">
					<span className="block whitespace-pre-wrap font-normal text-foreground/90">
						{sku.description || (
							<span className="text-muted-foreground/60">No description</span>
						)}
					</span>
				</ReadField>
				<ReadField label="Brand">
					{brand ? (
						<span className="inline-flex items-center gap-1.5">
							<span
								className="flex size-5 items-center justify-center rounded text-[10px] font-semibold text-white"
								style={{ backgroundColor: brand.color }}
							>
								{brand.name[0]}
							</span>
							{brand.name}
						</span>
					) : (
						sku.tenantId
					)}
				</ReadField>
				<ReadField label="Billing Cycle">{billingLabel(sku.billingCycle)}</ReadField>
			</CardContent>
		</Card>
	);
}

function LifecycleReadCard({ sku }: { sku: Sku }) {
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={CalendarClockIcon} />
				<CardTitle>Plan Lifecycle</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Status">
					<Badge
						variant="outline"
						className={cn(
							'gap-1.5',
							sku.status === 'active'
								? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
								: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
						)}
					>
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: sku.status === 'active' ? '#00B86E' : '#E8536A' }}
						/>
						{sku.status === 'active' ? 'Active' : 'Inactive'}
					</Badge>
				</ReadField>
				<ReadField label="Created">{formatTimestamp(sku.createdAt)}</ReadField>
				<ReadField label="Last Modified">{formatTimestamp(sku.updatedAt)}</ReadField>
				<ReadField label="Version Count">
					{sku.versions.length} {sku.versions.length === 1 ? 'version' : 'versions'} tracked
				</ReadField>
			</CardContent>
		</Card>
	);
}

function PricingReadCard({ sku }: { sku: Sku }) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={CoinsIcon} />
				<CardTitle>Pricing</CardTitle>
				<Badge variant="secondary" className="ml-1 rounded-full px-2 font-medium tabular-nums">
					{sku.prices.length}
				</Badge>
			</CardHeader>
			<Divider />
			<CardContent>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{sku.prices.map((p) => (
						<PriceTile key={p.currency} price={p} cycle={sku.billingCycle} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PriceTile({ price, cycle }: { price: Price; cycle: Sku['billingCycle'] }) {
	return (
		<div className="flex flex-col gap-1 rounded-lg border bg-[#FAFAFA] p-3">
			<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{price.currency}
			</span>
			<span className="text-lg font-semibold tabular-nums text-foreground">
				{formatPrice(price)}
			</span>
			<span className="text-xs text-muted-foreground">{billingLabel(cycle)}</span>
		</div>
	);
}

function TrialReadCard({ sku }: { sku: Sku }) {
	const t = sku.trial;
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={GiftIcon} />
				<CardTitle>Trial &amp; Introductory Pricing</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Trial Type">
					{t.type === 'none'
						? 'None — charge from day one'
						: t.type === 'free_trial'
							? 'Free Trial'
							: 'Introductory Pricing'}
				</ReadField>
				{t.type === 'free_trial' ? (
					<ReadField label="Free Trial Duration">{t.freeTrialDays} days</ReadField>
				) : null}
				{t.type === 'introductory_pricing' ? (
					<>
						<ReadField label="Introductory Period">{t.introDurationDays} days</ReadField>
						<div className="flex flex-col gap-2">
							<span className="text-xs font-medium text-muted-foreground">Introductory Prices</span>
							<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
								{(t.introPrices ?? []).map((p) => (
									<PriceTile key={p.currency} price={p} cycle={sku.billingCycle} />
								))}
							</div>
						</div>
					</>
				) : null}
				{t.type === 'none' ? (
					<p className="text-sm text-muted-foreground">{trialSummary(t)}.</p>
				) : null}
			</CardContent>
		</Card>
	);
}

function HistoryCard({ versions }: { versions: PriceVersion[] }) {
	const ordered = [...versions].sort((a, b) =>
		a.effectiveFrom < b.effectiveFrom ? 1 : -1,
	);
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={HistoryIcon} />
				<CardTitle>Version History</CardTitle>
				<Badge variant="secondary" className="ml-1 rounded-full px-2 font-medium tabular-nums">
					{versions.length}
				</Badge>
			</CardHeader>
			<Divider />
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[160px]">Effective From</TableHead>
							<TableHead>Prices</TableHead>
							<TableHead className="w-[160px]">Changed By</TableHead>
							<TableHead>Note</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ordered.map((v, i) => (
							<TableRow key={v.id}>
								<TableCell className="align-top text-sm">
									<div className="flex flex-col gap-0.5">
										<span className="font-medium text-foreground">{formatDate(v.effectiveFrom)}</span>
										{i === 0 ? (
											<Badge
												variant="outline"
												className="w-fit border-[#224089]/30 bg-[#224089]/10 text-[10px] text-[#224089]"
											>
												Current
											</Badge>
										) : null}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1.5">
										{v.prices.map((p) => (
											<span
												key={p.currency}
												className="inline-flex items-center gap-1 rounded-md border bg-[#FAFAFA] px-1.5 py-0.5 text-xs"
											>
												<span className="font-medium uppercase text-muted-foreground">
													{p.currency}
												</span>
												<span className="font-mono font-medium tabular-nums text-foreground">
													{formatPrice(p)}
												</span>
											</span>
										))}
									</div>
								</TableCell>
								<TableCell className="align-top text-sm">{v.changedBy}</TableCell>
								<TableCell className="align-top text-sm text-muted-foreground">
									{v.note ?? <span className="text-muted-foreground/60">—</span>}
								</TableCell>
							</TableRow>
						))}
						{versions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
									No version history yet.
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
