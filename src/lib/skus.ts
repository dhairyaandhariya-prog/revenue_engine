// Mock data layer for the SKU manager.
// Mirrors the shape we'd expect from a real catalog API — plan metadata,
// per-currency pricing, trial config, lifecycle status, and a price-change
// audit trail.

export type BillingCycle =
	| 'daily'
	| 'weekly'
	| 'monthly'
	| 'quarterly'
	| 'yearly'
	| 'one_time';

export type Currency = 'USD' | 'BRL' | 'EUR' | 'GBP';

export type SkuStatus = 'active' | 'inactive';

export type TrialType = 'none' | 'free_trial' | 'introductory_pricing';

export type Price = {
	currency: Currency;
	amount: number;
};

export type TrialConfig = {
	type: TrialType;
	freeTrialDays?: number;
	introPrices?: Price[];
	introDurationDays?: number;
};

export type PriceVersion = {
	id: string;
	effectiveFrom: string;
	prices: Price[];
	changedBy: string;
	note?: string;
};

export type TenantBrand = {
	id: string;
	name: string;
	color: string;
};

export type Sku = {
	id: string;
	skuId: string;
	name: string;
	description: string;
	tenantId: string;
	billingCycle: BillingCycle;
	trial: TrialConfig;
	prices: Price[];
	status: SkuStatus;
	createdAt: string;
	updatedAt: string;
	versions: PriceVersion[];
};

export const TENANT_BRANDS: TenantBrand[] = [
	{ id: 'playkids', name: 'PlayKids', color: '#A400BC' },
	{ id: 'coolmath4kids', name: 'Coolmath4Kids', color: '#00B86E' },
];

export function getBrand(tenantId: string): TenantBrand | undefined {
	return TENANT_BRANDS.find((t) => t.id === tenantId);
}

export const BILLING_CYCLES: { value: BillingCycle; label: string; short: string }[] = [
	{ value: 'daily', label: 'Daily', short: '/day' },
	{ value: 'weekly', label: 'Weekly', short: '/wk' },
	{ value: 'monthly', label: 'Monthly', short: '/mo' },
	{ value: 'quarterly', label: 'Quarterly', short: '/qtr' },
	{ value: 'yearly', label: 'Yearly', short: '/yr' },
	{ value: 'one_time', label: 'One-time purchase', short: 'once' },
];

export function billingLabel(cycle: BillingCycle): string {
	return BILLING_CYCLES.find((c) => c.value === cycle)?.label ?? cycle;
}

export function billingShort(cycle: BillingCycle): string {
	return BILLING_CYCLES.find((c) => c.value === cycle)?.short ?? cycle;
}

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
	{ value: 'USD', label: 'US Dollar', symbol: '$' },
	{ value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
	{ value: 'EUR', label: 'Euro', symbol: '€' },
	{ value: 'GBP', label: 'British Pound', symbol: '£' },
];

export function currencySymbol(c: Currency): string {
	return CURRENCIES.find((cc) => cc.value === c)?.symbol ?? c;
}

export function formatPrice(p: Price): string {
	return `${currencySymbol(p.currency)}${p.amount.toFixed(2)}`;
}

export function trialSummary(t: TrialConfig): string {
	if (t.type === 'free_trial') return `${t.freeTrialDays ?? 0}-day free trial`;
	if (t.type === 'introductory_pricing') {
		const first = t.introPrices?.[0];
		const days = t.introDurationDays ?? 0;
		return first ? `Intro ${formatPrice(first)} for ${days} days` : `Intro for ${days} days`;
	}
	return 'No trial';
}

// ─── Mock catalog ────────────────────────────────────────────────────

const SKUS: Sku[] = [
	{
		id: 'sku-001',
		skuId: 'pk_premium_monthly_01',
		name: 'PlayKids Premium — Monthly',
		description: 'Full access to all premium content and characters. Renews monthly.',
		tenantId: 'playkids',
		billingCycle: 'monthly',
		trial: { type: 'free_trial', freeTrialDays: 7 },
		prices: [
			{ currency: 'USD', amount: 9.99 },
			{ currency: 'BRL', amount: 39.9 },
			{ currency: 'EUR', amount: 8.99 },
			{ currency: 'GBP', amount: 7.99 },
		],
		status: 'active',
		createdAt: '2025-09-12T10:21:00',
		updatedAt: '2026-04-22T09:03:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2025-09-12T10:21:00',
				prices: [
					{ currency: 'USD', amount: 8.99 },
					{ currency: 'BRL', amount: 34.9 },
					{ currency: 'EUR', amount: 7.99 },
					{ currency: 'GBP', amount: 6.99 },
				],
				changedBy: 'Marcus Reed',
				note: 'Launch pricing',
			},
			{
				id: 'v2',
				effectiveFrom: '2026-02-01T00:00:00',
				prices: [
					{ currency: 'USD', amount: 9.99 },
					{ currency: 'BRL', amount: 39.9 },
					{ currency: 'EUR', amount: 8.99 },
					{ currency: 'GBP', amount: 7.99 },
				],
				changedBy: 'Sophia Lee',
				note: 'Q1 2026 price uplift',
			},
		],
	},
	{
		id: 'sku-002',
		skuId: 'pk_premium_yearly_01',
		name: 'PlayKids Premium — Annual',
		description: 'Annual subscription with two months free vs monthly.',
		tenantId: 'playkids',
		billingCycle: 'yearly',
		trial: { type: 'free_trial', freeTrialDays: 14 },
		prices: [
			{ currency: 'USD', amount: 89.99 },
			{ currency: 'BRL', amount: 359.0 },
			{ currency: 'EUR', amount: 79.99 },
			{ currency: 'GBP', amount: 69.99 },
		],
		status: 'active',
		createdAt: '2025-09-12T10:21:00',
		updatedAt: '2026-03-18T11:42:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2025-09-12T10:21:00',
				prices: [
					{ currency: 'USD', amount: 89.99 },
					{ currency: 'BRL', amount: 359.0 },
					{ currency: 'EUR', amount: 79.99 },
					{ currency: 'GBP', amount: 69.99 },
				],
				changedBy: 'Marcus Reed',
				note: 'Launch pricing',
			},
		],
	},
	{
		id: 'sku-003',
		skuId: 'pk_promo_monthly_01',
		name: 'PlayKids Promo — Monthly',
		description: 'Acquisition-focused monthly plan with an extended 30-day free trial.',
		tenantId: 'playkids',
		billingCycle: 'monthly',
		trial: { type: 'free_trial', freeTrialDays: 30 },
		prices: [
			{ currency: 'USD', amount: 9.99 },
			{ currency: 'BRL', amount: 39.9 },
			{ currency: 'EUR', amount: 8.99 },
			{ currency: 'GBP', amount: 7.99 },
		],
		status: 'active',
		createdAt: '2026-01-15T08:00:00',
		updatedAt: '2026-04-12T16:30:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2026-01-15T08:00:00',
				prices: [
					{ currency: 'USD', amount: 9.99 },
					{ currency: 'BRL', amount: 39.9 },
					{ currency: 'EUR', amount: 8.99 },
					{ currency: 'GBP', amount: 7.99 },
				],
				changedBy: 'Priya Sharma',
				note: 'Q1 acquisition campaign',
			},
		],
	},
	{
		id: 'sku-004',
		skuId: 'pk_legacy_weekly_01',
		name: 'PlayKids Weekly (Legacy)',
		description: 'Retired weekly tier — kept for existing subscribers only.',
		tenantId: 'playkids',
		billingCycle: 'weekly',
		trial: { type: 'none' },
		prices: [
			{ currency: 'USD', amount: 2.99 },
			{ currency: 'BRL', amount: 11.9 },
		],
		status: 'inactive',
		createdAt: '2024-06-01T09:00:00',
		updatedAt: '2025-12-10T13:20:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2024-06-01T09:00:00',
				prices: [
					{ currency: 'USD', amount: 2.99 },
					{ currency: 'BRL', amount: 11.9 },
				],
				changedBy: 'Marcus Reed',
				note: 'Initial release',
			},
			{
				id: 'v2',
				effectiveFrom: '2025-12-10T13:20:00',
				prices: [
					{ currency: 'USD', amount: 2.99 },
					{ currency: 'BRL', amount: 11.9 },
				],
				changedBy: 'Sophia Lee',
				note: 'Retired — disabled for new purchases',
			},
		],
	},
	{
		id: 'sku-005',
		skuId: 'cm_premium_monthly_01',
		name: 'Coolmath4Kids Premium — Monthly',
		description: 'Ad-free experience plus all curriculum content. Monthly billing.',
		tenantId: 'coolmath4kids',
		billingCycle: 'monthly',
		trial: { type: 'free_trial', freeTrialDays: 30 },
		prices: [
			{ currency: 'USD', amount: 7.99 },
			{ currency: 'EUR', amount: 6.99 },
			{ currency: 'GBP', amount: 5.99 },
		],
		status: 'active',
		createdAt: '2026-04-06T16:55:00',
		updatedAt: '2026-04-17T14:14:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2026-04-06T16:55:00',
				prices: [
					{ currency: 'USD', amount: 7.99 },
					{ currency: 'EUR', amount: 6.99 },
					{ currency: 'GBP', amount: 5.99 },
				],
				changedBy: 'Aiden Carter',
				note: 'Launch pricing',
			},
		],
	},
	{
		id: 'sku-006',
		skuId: 'cm_premium_yearly_01',
		name: 'Coolmath4Kids Premium — Annual',
		description: 'Annual plan, billed once a year with savings vs monthly.',
		tenantId: 'coolmath4kids',
		billingCycle: 'yearly',
		trial: { type: 'free_trial', freeTrialDays: 30 },
		prices: [
			{ currency: 'USD', amount: 69.99 },
			{ currency: 'EUR', amount: 59.99 },
			{ currency: 'GBP', amount: 49.99 },
		],
		status: 'active',
		createdAt: '2026-04-06T16:55:00',
		updatedAt: '2026-04-17T14:14:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2026-04-06T16:55:00',
				prices: [
					{ currency: 'USD', amount: 69.99 },
					{ currency: 'EUR', amount: 59.99 },
					{ currency: 'GBP', amount: 49.99 },
				],
				changedBy: 'Aiden Carter',
				note: 'Launch pricing',
			},
		],
	},
	{
		id: 'sku-007',
		skuId: 'cm_family_monthly_01',
		name: 'Coolmath4Kids Family — Monthly',
		description: 'Family plan for up to 5 child profiles on Coolmath4Kids.',
		tenantId: 'coolmath4kids',
		billingCycle: 'monthly',
		trial: { type: 'free_trial', freeTrialDays: 14 },
		prices: [
			{ currency: 'USD', amount: 12.99 },
			{ currency: 'EUR', amount: 10.99 },
			{ currency: 'GBP', amount: 9.99 },
		],
		status: 'active',
		createdAt: '2026-02-20T10:30:00',
		updatedAt: '2026-04-22T09:15:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2026-02-20T10:30:00',
				prices: [
					{ currency: 'USD', amount: 12.99 },
					{ currency: 'EUR', amount: 10.99 },
					{ currency: 'GBP', amount: 9.99 },
				],
				changedBy: 'Zara Ahmed',
				note: 'Family tier launch',
			},
		],
	},
	{
		id: 'sku-008',
		skuId: 'cm_lifetime_01',
		name: 'Coolmath4Kids Lifetime',
		description: 'One-time purchase, lifetime access. Limited offer, US only.',
		tenantId: 'coolmath4kids',
		billingCycle: 'one_time',
		trial: { type: 'none' },
		prices: [{ currency: 'USD', amount: 199.0 }],
		status: 'active',
		createdAt: '2026-03-01T12:00:00',
		updatedAt: '2026-03-01T12:00:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2026-03-01T12:00:00',
				prices: [{ currency: 'USD', amount: 199.0 }],
				changedBy: 'Diego Vega',
				note: 'Lifetime promo launch',
			},
		],
	},
	{
		id: 'sku-009',
		skuId: 'pk_quarterly_01',
		name: 'PlayKids Quarterly',
		description: 'Billed every 3 months. Discount vs monthly.',
		tenantId: 'playkids',
		billingCycle: 'quarterly',
		trial: { type: 'free_trial', freeTrialDays: 7 },
		prices: [
			{ currency: 'USD', amount: 24.99 },
			{ currency: 'BRL', amount: 99.9 },
			{ currency: 'EUR', amount: 21.99 },
		],
		status: 'inactive',
		createdAt: '2025-11-08T14:00:00',
		updatedAt: '2026-04-01T10:00:00',
		versions: [
			{
				id: 'v1',
				effectiveFrom: '2025-11-08T14:00:00',
				prices: [
					{ currency: 'USD', amount: 24.99 },
					{ currency: 'BRL', amount: 99.9 },
					{ currency: 'EUR', amount: 21.99 },
				],
				changedBy: 'Naomi Park',
				note: 'Trial pricing tier',
			},
			{
				id: 'v2',
				effectiveFrom: '2026-04-01T10:00:00',
				prices: [
					{ currency: 'USD', amount: 24.99 },
					{ currency: 'BRL', amount: 99.9 },
					{ currency: 'EUR', amount: 21.99 },
				],
				changedBy: 'Marcus Reed',
				note: 'Retired — low adoption',
			},
		],
	},
];

export function listSkus(): Sku[] {
	return SKUS;
}

export function getSku(id: string): Sku | undefined {
	return SKUS.find((s) => s.id === id || s.skuId === id);
}

export function emptySku(): Sku {
	const now = new Date().toISOString();
	return {
		id: '',
		skuId: '',
		name: '',
		description: '',
		tenantId: 'playkids',
		billingCycle: 'monthly',
		trial: { type: 'none' },
		prices: [{ currency: 'USD', amount: 0 }],
		status: 'active',
		createdAt: now,
		updatedAt: now,
		versions: [],
	};
}
