'use client';

import {
	BoxesIcon,
	CoinsIcon,
	GiftIcon,
	PlusIcon,
	Trash2Icon,
} from 'lucide-react';
import * as React from 'react';
import { StatusSwitch } from '@/components/status-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	BILLING_CYCLES,
	CURRENCIES,
	currencySymbol,
	type BillingCycle,
	type Currency,
	type Price,
	type Sku,
} from '@/lib/skus';

// Trial types supported by the editor today. Existing intro-pricing SKUs are
// still readable in detail view; editing one will coerce it to a free trial.
export type FormTrialType = 'none' | 'free_trial';

// Brand/tenant scoping is owned by the page (via `useTenant`), not the form.
export type SkuFormValue = {
	skuId: string;
	name: string;
	description: string;
	billingCycle: BillingCycle;
	status: 'active' | 'inactive';
	trialType: FormTrialType;
	freeTrialDays: number;
	prices: Price[];
};

export function skuToForm(s: Sku): SkuFormValue {
	return {
		skuId: s.skuId,
		name: s.name,
		description: s.description,
		billingCycle: s.billingCycle,
		status: s.status,
		// Existing introductory_pricing → free_trial on edit (one-way coerce).
		trialType: s.trial.type === 'free_trial' ? 'free_trial' : 'none',
		freeTrialDays: s.trial.freeTrialDays ?? 7,
		prices: s.prices.length > 0 ? s.prices : [{ currency: 'USD', amount: 0 }],
	};
}

export const EMPTY_SKU_FORM: SkuFormValue = {
	skuId: '',
	name: '',
	description: '',
	billingCycle: 'monthly',
	status: 'active',
	trialType: 'none',
	freeTrialDays: 7,
	prices: [{ currency: 'USD', amount: 0 }],
};

type Props = {
	value: SkuFormValue;
	onChange: React.Dispatch<React.SetStateAction<SkuFormValue>>;
};

export function SkuFormSections({ value, onChange }: Props) {
	function set<K extends keyof SkuFormValue>(key: K, v: SkuFormValue[K]) {
		onChange((p) => ({ ...p, [key]: v }));
	}

	// Layout:
	// ┌───────────────────┬────────────────┐
	// │                   │  Trial         │
	// │  Plan Details     ├────────────────┤
	// │                   │  Pricing       │
	// └───────────────────┴────────────────┘
	//
	// `items-start` on the grid + a separate flex column on the right
	// guarantee each card sizes to its own content. Plan Details stays
	// its natural height; Trial and Pricing never stretch into one another.
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
			<DetailsCard value={value} set={set} />
			<div className="flex flex-col gap-4">
				<TrialCard value={value} set={set} />
				<PricingCard value={value} set={set} />
			</div>
		</div>
	);
}

// ─── Details (now includes Status switch at the bottom) ──────────────

function DetailsCard({
	value,
	set,
}: {
	value: SkuFormValue;
	set: <K extends keyof SkuFormValue>(k: K, v: SkuFormValue[K]) => void;
}) {
	const active = value.status === 'active';
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={BoxesIcon} />
				<CardTitle>Plan Details</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<FormRow label="Plan Name" required>
					<Input
						value={value.name}
						placeholder="PlayKids Premium — Monthly"
						onChange={(e) => set('name', e.target.value)}
					/>
				</FormRow>
				<FormRow
					label="SKU ID"
					required
					helper="Unique, lowercase, underscores. Example: pk_premium_monthly_01"
				>
					<Input
						value={value.skuId}
						placeholder="pk_premium_monthly_01"
						className="font-mono"
						onChange={(e) => set('skuId', e.target.value)}
					/>
				</FormRow>
				<FormRow label="Internal Description" helper="Visible to admins only.">
					<textarea
						value={value.description}
						onChange={(e) => set('description', e.target.value)}
						rows={3}
						placeholder="What does this plan grant access to?"
						className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>
				</FormRow>
				<FormRow label="Billing Cycle" required>
					<Select
						value={value.billingCycle}
						onValueChange={(v) => set('billingCycle', v as BillingCycle)}
					>
						<SelectTrigger className="!h-9 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BILLING_CYCLES.map((c) => (
								<SelectItem key={c.value} value={c.value}>
									{c.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormRow>
				<FormRow
					label="Status"
					required
					helper="Inactive SKUs are hidden from new purchases. Status changes are tracked in Version History."
				>
					<StatusSwitch
						active={active}
						onChange={(v) => set('status', v ? 'active' : 'inactive')}
					/>
				</FormRow>
			</CardContent>
		</Card>
	);
}

// ─── Trial (None / Free Trial only) ──────────────────────────────────

function TrialCard({
	value,
	set,
}: {
	value: SkuFormValue;
	set: <K extends keyof SkuFormValue>(k: K, v: SkuFormValue[K]) => void;
}) {
	const isFree = value.trialType === 'free_trial';

	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={GiftIcon} />
				<CardTitle>Trial</CardTitle>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<FormRow label="Trial Type">
					<div className="grid grid-cols-2 gap-2">
						<TrialOption
							active={value.trialType === 'none'}
							title="None"
							subtitle="Charge from day one"
							onClick={() => set('trialType', 'none')}
						/>
						<TrialOption
							active={isFree}
							title="Free Trial"
							subtitle="Free for N days"
							onClick={() => set('trialType', 'free_trial')}
						/>
					</div>
				</FormRow>

				{isFree ? (
					<FormRow label="Free Trial Duration" required>
						<div className="flex flex-wrap items-center gap-2">
							<div className="relative">
								<Input
									type="number"
									min={1}
									className="h-9 w-28 pr-10 tabular-nums"
									value={value.freeTrialDays}
									onChange={(e) => set('freeTrialDays', Math.max(1, Number(e.target.value) || 0))}
								/>
								<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
									days
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								{[7, 14, 30].map((d) => (
									<button
										key={d}
										type="button"
										onClick={() => set('freeTrialDays', d)}
										className={
											'rounded-full border px-2.5 py-0.5 text-xs font-medium transition ' +
											(value.freeTrialDays === d
												? 'border-[#224089] bg-[#224089]/10 text-[#224089]'
												: 'border-border bg-card text-muted-foreground hover:border-[#224089]/40 hover:text-[#224089]')
										}
									>
										{d}d
									</button>
								))}
							</div>
						</div>
					</FormRow>
				) : null}
			</CardContent>
		</Card>
	);
}

function TrialOption({
	active,
	title,
	subtitle,
	onClick,
}: {
	active: boolean;
	title: string;
	subtitle: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={
				'flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition ' +
				(active
					? 'border-[#224089] bg-[#224089]/5 ring-1 ring-[#224089]/20'
					: 'border-border bg-card hover:border-[#224089]/40 hover:bg-[#224089]/5')
			}
		>
			<span className={'text-sm font-medium ' + (active ? 'text-[#224089]' : 'text-foreground')}>
				{title}
			</span>
			<span className="text-xs text-muted-foreground">{subtitle}</span>
		</button>
	);
}

// ─── Pricing ─────────────────────────────────────────────────────────

function PricingCard({
	value,
	set,
}: {
	value: SkuFormValue;
	set: <K extends keyof SkuFormValue>(k: K, v: SkuFormValue[K]) => void;
}) {
	const used = new Set(value.prices.map((p) => p.currency));
	const available = CURRENCIES.filter((c) => !used.has(c.value));

	function updatePrice(i: number, patch: Partial<Price>) {
		set(
			'prices',
			value.prices.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
		);
	}

	function addPrice() {
		if (available.length === 0) return;
		set('prices', [...value.prices, { currency: available[0].value, amount: 0 }]);
	}

	function removePrice(i: number) {
		if (value.prices.length <= 1) return;
		set(
			'prices',
			value.prices.filter((_, idx) => idx !== i),
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<CardIcon icon={CoinsIcon} />
					<CardTitle>Pricing</CardTitle>
					<Badge variant="secondary" className="ml-1 rounded-full px-2 font-medium tabular-nums">
						{value.prices.length}
					</Badge>
				</div>
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="h-8"
					disabled={available.length === 0}
					onClick={addPrice}
				>
					<PlusIcon />
					Add currency
				</Button>
			</CardHeader>
			<Divider />
			<CardContent className="flex flex-col gap-5">
				<p className="text-xs text-muted-foreground">
					Set the price for each market. Subscribers see the currency for their region.
				</p>
				<div className="flex flex-col gap-2">
					{value.prices.map((p, i) => (
						<PriceRow
							key={p.currency + '-' + i}
							price={p}
							onChange={(patch) => updatePrice(i, patch)}
							onRemove={value.prices.length > 1 ? () => removePrice(i) : undefined}
							disabledCurrencies={
								new Set(
									value.prices.filter((_, idx) => idx !== i).map((pp) => pp.currency),
								)
							}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function PriceRow({
	price,
	onChange,
	onRemove,
	disabledCurrencies,
}: {
	price: Price;
	onChange: (patch: Partial<Price>) => void;
	onRemove?: () => void;
	disabledCurrencies: Set<Currency>;
}) {
	return (
		<div className="flex items-center gap-2">
			<Select value={price.currency} onValueChange={(v) => onChange({ currency: v as Currency })}>
				<SelectTrigger className="!h-9 w-[120px] shrink-0">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{CURRENCIES.map((c) => (
						<SelectItem key={c.value} value={c.value} disabled={disabledCurrencies.has(c.value)}>
							{c.symbol} {c.value}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<div className="relative flex-1">
				<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
					{currencySymbol(price.currency)}
				</span>
				<Input
					type="number"
					min={0}
					step="0.01"
					value={Number.isNaN(price.amount) ? '' : price.amount}
					onChange={(e) =>
						onChange({ amount: e.target.value === '' ? 0 : Number(e.target.value) })
					}
					className="h-9 pl-7 font-mono tabular-nums"
				/>
			</div>
			{onRemove ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Remove price"
					className="size-9 shrink-0 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
					onClick={onRemove}
				>
					<Trash2Icon />
				</Button>
			) : (
				<span className="size-9 shrink-0" aria-hidden />
			)}
		</div>
	);
}

// ─── Shared bits ─────────────────────────────────────────────────────

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

function FormRow({
	label,
	required,
	helper,
	children,
}: {
	label: string;
	required?: boolean;
	helper?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm font-medium text-foreground">
				{label}
				{required ? <span className="ml-0.5 text-[#E8536A]">*</span> : null}
			</label>
			{children}
			{helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
		</div>
	);
}
