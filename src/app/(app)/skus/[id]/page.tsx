'use client';

import {
	BoxesIcon,
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
import { StatusLabel } from '@/components/status-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
	billingLabel,
	formatPrice,
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
			billingCycle: form.billingCycle,
			status: form.status,
			prices: form.prices,
			trial:
				form.trialType === 'free_trial'
					? { type: 'free_trial', freeTrialDays: form.freeTrialDays }
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
						{/* Mirror the create layout. `items-start` on the grid +
						    the inner flex column on the right keep each card's
						    height tied to its own content only. */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
							<DetailsReadCard sku={sku} />
							<div className="flex flex-col gap-4">
								<TrialReadCard sku={sku} />
								<PricingReadCard sku={sku} />
							</div>
						</div>
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
	const active = sku.status === 'active';
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
				<ReadField label="Billing Cycle">{billingLabel(sku.billingCycle)}</ReadField>
				<ReadField label="Status">
					<StatusLabel active={active} />
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
				<div className="grid grid-cols-2 gap-2">
					{sku.prices.map((p) => (
						<PriceTile key={p.currency} price={p} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// Compact, horizontal tile. Billing cycle isn't repeated here — it's right
// above in Plan Details, so showing it on every tile is redundant noise.
function PriceTile({ price }: { price: Price }) {
	return (
		<div className="flex items-baseline justify-between gap-2 rounded-lg border bg-[#FAFAFA] px-3 py-2">
			<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{price.currency}
			</span>
			<span className="text-sm font-semibold tabular-nums text-foreground">
				{formatPrice(price)}
			</span>
		</div>
	);
}

function TrialReadCard({ sku }: { sku: Sku }) {
	const t = sku.trial;
	const isFree = t.type === 'free_trial';
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={GiftIcon} />
				<CardTitle>Trial</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Trial Type">
					{isFree ? 'Free Trial' : 'None — charge from day one'}
				</ReadField>
				{isFree ? (
					<ReadField label="Free Trial Duration">{t.freeTrialDays} days</ReadField>
				) : (
					<p className="text-sm text-muted-foreground">{trialSummary(t)}.</p>
				)}
			</CardContent>
		</Card>
	);
}

// Matches the Subscription Period table styling from User Detail.
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
			<CardContent>
				<div className="overflow-hidden rounded-lg border bg-card">
					<Table>
						<TableHeader className="[&_th]:border-b [&_th]:bg-muted [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
							<TableRow>
								<TableHead className="w-[180px]">Effective From</TableHead>
								<TableHead>Prices</TableHead>
								<TableHead className="w-[180px]">Changed By</TableHead>
								<TableHead>Note</TableHead>
								<TableHead className="w-[100px] text-right">Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_tr]:bg-card">
							{versions.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="py-6 text-center text-sm italic text-muted-foreground"
									>
										No version history yet.
									</TableCell>
								</TableRow>
							) : (
								ordered.map((v, i) => (
									<TableRow key={v.id}>
										<TableCell className="align-top text-sm text-foreground">
											<span className="font-semibold text-[#224089]">
												{formatTimestamp(v.effectiveFrom)}
											</span>
										</TableCell>
										<TableCell className="align-top">
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
										<TableCell className="align-top text-sm text-foreground">
											{v.changedBy}
										</TableCell>
										<TableCell className="align-top text-sm text-muted-foreground">
											{v.note ?? <span className="text-muted-foreground/60">—</span>}
										</TableCell>
										<TableCell className="align-top text-right">
											{i === 0 ? (
												<Badge
													variant="outline"
													className="border-[#224089]/30 bg-[#224089]/10 text-[10px] text-[#224089]"
												>
													Current
												</Badge>
											) : (
												<span className="text-muted-foreground/60">—</span>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
