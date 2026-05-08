// Mock user-detail builder. Real data will come from the API later;
// for now we generate realistic per-user values from the ID itself.

export type UserStatus = 'Active' | 'Inactive';

export type SubscriptionPeriod = {
	id: string;
	startsAt: string;
	endsAt: string;
	transactionId?: string;
};

export type UserSubscription = {
	id: string;
	kind: string;
	status: 'active' | 'inactive';
	expiresAt: string;
	periods: SubscriptionPeriod[];
};

export type UserCredential = {
	kind: CredentialKindValue;
	email?: string;
	appleId?: string;
	phoneNumber?: string;
	identifier?: string; // generic
};

export const PROFILE_CHARACTERS = ['Kate', 'Lupi', 'Mimi', 'Junior', 'Theo'] as const;
export type ProfileCharacter = (typeof PROFILE_CHARACTERS)[number];

export type UserProfile = {
	id: string;
	name: string;
	character: ProfileCharacter;
	birthdate: string; // ISO date string (YYYY-MM-DD)
	createdAt: string; // ISO date string
	updatedAt: string | null; // ISO date string or null
};

export const IDENTITY_KINDS = [
	{ value: 'cpf', label: 'CPF' },
	{ value: 'cnpj', label: 'CNPJ' },
	{ value: 'ssn', label: 'SSN' },
	{ value: 'other', label: 'Other' },
] as const;
export type IdentityKind = (typeof IDENTITY_KINDS)[number]['value'];

export function identityKindLabel(kind: IdentityKind): string {
	return IDENTITY_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export const CREDENTIAL_KINDS = [
	{ value: 'generic', label: 'Generic' },
	{ value: 'kiwi_legacy_password', label: 'Kiwi Legacy' },
	{ value: 'email_password', label: 'Email Password' },
	{ value: 'apple_login', label: 'Apple Login' },
	{ value: 'phone_number', label: 'Phone Number' },
] as const;
export type CredentialKindValue = (typeof CREDENTIAL_KINDS)[number]['value'];

export type UserAddress = {
	line1: string;
	city: string;
	cityCode: string;
	state: string;
	country: string;
	zip: string;
};

export type IdentityDocument = {
	code: string;
	kind: IdentityKind;
};

export type PartnerData = {
	stripeCustomerId?: string;
	vindiCustomerId?: string;
	vizioCustomerId?: string;
	minuUserIdentity?: string;
	wisterUserId?: string;
	samsungGalaxyStoreAccountId?: string;
	samsungTvCustomerId?: string;
	sankhyaUserId?: string;
	lgUserId?: string;
};

export type InvoiceReport = {
	id: string;
	orderNumber: string;
	subscriptionPeriodId: string;
	subscriptionPeriodStart: string;
	subscriptionPeriodEnd: string;
	transactionId: string;
	isConfirmed: boolean;
	isSent: boolean;
	createdAt: string;
	updatedAt: string;
};

export type UserDetail = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	kiwiLegacyAccountUuid: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string | null;
	partnerData: PartnerData;
	profiles: UserProfile[];
	address: UserAddress | null;
	identityDocuments: IdentityDocument[];
	credentials: UserCredential[];
	subscriptions: UserSubscription[];
	invoiceReports: InvoiceReport[];
};

function buildSubscriptions(variant: number): UserSubscription[] {
	if (variant === 0) {
		return [
			{
				id: '6',
				kind: 'google_play',
				status: 'active',
				expiresAt: '2023-10-02T22:35:39.143000',
				periods: [
					{
						id: '16971',
						startsAt: '2023-10-20T23:15:15.843935',
						endsAt: '2023-10-02T22:35:39.143000',
						transactionId: 'GPA.3345-5206-5509-39209..6',
					},
					{
						id: '2',
						startsAt: '2023-10-02T19:02:42.592000',
						endsAt: '2023-10-02T19:35:34.689000',
						transactionId: 'GPA.3345-5206-5509-39209..0',
					},
				],
			},
			{
				id: '5',
				kind: 'legacy_internal',
				status: 'active',
				expiresAt: '2022-08-15T20:26:29',
				periods: [],
			},
		];
	}
	if (variant === 1) {
		return [
			{
				id: '70442',
				kind: 'daileon',
				status: 'active',
				expiresAt: '2027-03-18T21:05:18.780042',
				periods: [
					{
						id: '424591',
						startsAt: '2026-03-18T21:05:18.780023',
						endsAt: '2027-03-18T21:05:18.780042',
						transactionId: 'DLN.7821-9300-44',
					},
					{
						id: '424102',
						startsAt: '2025-03-18T21:05:18.000000',
						endsAt: '2026-03-18T21:05:18.000000',
						transactionId: 'DLN.6510-2241-39',
					},
				],
			},
			{
				id: '69810',
				kind: 'stripe',
				status: 'inactive',
				expiresAt: '2025-12-01T10:00:00',
				periods: [
					{
						id: '420013',
						startsAt: '2024-12-01T10:00:00',
						endsAt: '2025-12-01T10:00:00',
						transactionId: 'ch_3PqR9b2EnK4yLmZv1aBC',
					},
				],
			},
		];
	}
	if (variant === 2) {
		return [
			{
				id: '88112',
				kind: 'app_store',
				status: 'active',
				expiresAt: '2027-01-15T08:30:00',
				periods: [
					{
						id: '512908',
						startsAt: '2026-01-15T08:30:00',
						endsAt: '2027-01-15T08:30:00',
						transactionId: '210000123456789',
					},
					{
						id: '512701',
						startsAt: '2025-01-15T08:30:00',
						endsAt: '2026-01-15T08:30:00',
						transactionId: '210000123456701',
					},
					{
						id: '512544',
						startsAt: '2024-01-15T08:30:00',
						endsAt: '2025-01-15T08:30:00',
						transactionId: '210000123456622',
					},
				],
			},
			{
				id: '88011',
				kind: 'samsung_tv',
				status: 'active',
				expiresAt: '2026-08-22T14:10:00',
				periods: [
					{
						id: '511002',
						startsAt: '2025-08-22T14:10:00',
						endsAt: '2026-08-22T14:10:00',
					},
				],
			},
		];
	}
	return [
		{
			id: '70442',
			kind: 'daileon',
			status: 'active',
			expiresAt: '2027-03-18T21:05:18.780042',
			periods: [
				{
					id: '424591',
					startsAt: '2026-03-18T21:05:18.780023',
					endsAt: '2027-03-18T21:05:18.780042',
					transactionId: 'DLN.7821-9300-44',
				},
			],
		},
		{
			id: '70410',
			kind: 'vizio',
			status: 'inactive',
			expiresAt: '2024-09-01T00:00:00',
			periods: [
				{
					id: '423110',
					startsAt: '2023-09-01T00:00:00',
					endsAt: '2024-09-01T00:00:00',
					transactionId: 'VIZ-9921-MX',
				},
				{
					id: '422980',
					startsAt: '2022-09-01T00:00:00',
					endsAt: '2023-09-01T00:00:00',
					transactionId: 'VIZ-7820-MX',
				},
			],
		},
		{
			id: '70390',
			kind: 'roku',
			status: 'active',
			expiresAt: '2027-05-30T18:00:00',
			periods: [
				{
					id: '422051',
					startsAt: '2026-05-30T18:00:00',
					endsAt: '2027-05-30T18:00:00',
					transactionId: 'RKU-3211-7791',
				},
			],
		},
	];
}

// Cheap deterministic hash so the same id always yields the same detail.
function seed(id: string) {
	let h = 0;
	for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return h;
}

// Identity-document edge-case demos for the top of the list.
// 932304 (1st row): empty
// 932303 (2nd row): single document
// 932302 (3rd row): four documents (one of each kind)
const IDENTITY_OVERRIDES: Record<string, IdentityDocument[]> = {
	'932304': [],
	'932303': [{ kind: 'cpf', code: '55398587277' }],
	'932302': [
		{ kind: 'cnpj', code: '02263723321096' },
		{ kind: 'cpf', code: '55398587277' },
		{ kind: 'other', code: 'HE2AJVID7' },
		{ kind: 'ssn', code: '044346954' },
	],
};

// Old-design comparison users at the bottom of the list.
// 932294 (tabs-old) → empty state demo
// 932293 (bento-old) → fully filled state demo
function emptyUser(id: string): UserDetail {
	return {
		id,
		firstName: null,
		lastName: null,
		kiwiLegacyAccountUuid: null,
		isActive: false,
		createdAt: '2026-03-18T21:05:17.793890+00:00',
		updatedAt: null,
		partnerData: {},
		profiles: [],
		address: null,
		identityDocuments: [],
		credentials: [],
		subscriptions: [],
		invoiceReports: [],
	};
}

function filledUser(id: string): UserDetail {
	return {
		id,
		firstName: 'Bruna',
		lastName: 'Dias',
		kiwiLegacyAccountUuid: 'c1e8d5b7-9a3f-4d2c-8e6b-7d4a1f9c2e5b',
		isActive: true,
		createdAt: '2024-11-01T09:30:00.000000+00:00',
		updatedAt: '2026-05-04T11:22:33.000000+00:00',
		partnerData: {
			stripeCustomerId: 'cus_PnZ2k7M3Lr5Xg9aB',
			vindiCustomerId: 'V-4892173',
			vizioCustomerId: 'VIZ-77291',
			minuUserIdentity: 'minu-3942',
			wisterUserId: 'WST-5571',
			samsungGalaxyStoreAccountId: 'SGS-99812',
			samsungTvCustomerId: 'STV-44120',
			sankhyaUserId: 'SNK-88210',
			lgUserId: 'LG-21073',
		},
		profiles: [
			{
				id: 'p1',
				name: 'Testinho Jr',
				character: 'Junior',
				birthdate: '2020-12-31',
				createdAt: '2021-01-15',
				updatedAt: '2024-08-02',
			},
			{
				id: 'p2',
				name: 'Testinho Mid',
				character: 'Mimi',
				birthdate: '2015-12-31',
				createdAt: '2016-02-04',
				updatedAt: null,
			},
			{
				id: 'p3',
				name: 'Testinho Sr',
				character: 'Kate',
				birthdate: '2010-06-12',
				createdAt: '2010-07-01',
				updatedAt: '2024-08-02',
			},
		],
		address: {
			line1: 'Rua Blandina Gomes Junqueira, Loteamento Quinta do Oeste - 123',
			city: 'Franca',
			cityCode: '3516200',
			state: 'SP',
			country: 'BR',
			zip: '14408-194',
		},
		identityDocuments: [
			{ kind: 'cnpj', code: '02263723321096' },
			{ kind: 'cpf', code: '55398587277' },
			{ kind: 'ssn', code: '044346954' },
		],
		credentials: [
			{ kind: 'email_password', email: 'bruna.dias@playkids.com' },
			{ kind: 'apple_login', appleId: '001234.bruna.dias' },
			{ kind: 'phone_number', phoneNumber: '+55 11 98765-4321' },
		],
		subscriptions: buildSubscriptions(0),
		invoiceReports: [
			{
				id: '9797',
				orderNumber: '40274998',
				subscriptionPeriodId: '20370916',
				subscriptionPeriodStart: '2026-05-01T18:24:52.179413',
				subscriptionPeriodEnd: '2026-06-01T18:24:52.179413',
				transactionId: '5147071',
				isConfirmed: true,
				isSent: true,
				createdAt: '2026-04-30T13:05:10.714332+00:00',
				updatedAt: '2026-04-30T13:05:16.045021+00:00',
			},
			{
				id: '8126',
				orderNumber: '39584776',
				subscriptionPeriodId: '17068133',
				subscriptionPeriodStart: '2026-03-31T18:24:52.179395',
				subscriptionPeriodEnd: '2026-05-01T18:24:52.179413',
				transactionId: '4862109',
				isConfirmed: true,
				isSent: true,
				createdAt: '2026-03-31T18:30:07.577937+00:00',
				updatedAt: '2026-03-31T18:30:20.034620+00:00',
			},
		],
	};
}

export function getUserDetail(id: string): UserDetail {
	if (id === '932294') return emptyUser(id);
	if (id === '932293') return filledUser(id);

	const s = seed(id);
	const variant = s % 4;

	const hasName = variant !== 0;
	const hasAddress = variant === 1 || variant === 3;
	const hasIdentity = variant === 1 || variant === 2;
	const hasKiwi = variant === 0 || variant === 2;
	const hasProfiles = variant === 1 || variant === 3;

	const identityDocuments =
		IDENTITY_OVERRIDES[id] ??
		(hasIdentity ? [{ code: '42243216884', kind: 'cpf' as IdentityKind }] : []);

	return {
		id,
		firstName: hasName ? 'rodrigo' : null,
		lastName: hasName ? 'p' : null,
		kiwiLegacyAccountUuid: hasKiwi ? '5cb0dc0c-b98b-46c3-aaf5-38a63dfe81e8' : null,
		isActive: true,
		createdAt: '2026-03-18T21:05:17.793890+00:00',
		updatedAt: variant === 3 ? '2026-04-12T08:14:02.000000+00:00' : null,
		partnerData: {
			stripeCustomerId: variant === 3 ? 'cus_PnZ2k7M3Lr5Xg9aB' : undefined,
			vindiCustomerId: variant === 3 ? 'V-4892173' : undefined,
		},
		profiles: hasProfiles
			? [
					{
						id: 'p1',
						name: 'Testinho Jr',
						character: 'Junior',
						birthdate: '2020-12-31',
						createdAt: '2021-01-15',
						updatedAt: '2024-08-02',
					},
					{
						id: 'p2',
						name: 'Testinho Mid',
						character: 'Mimi',
						birthdate: '2015-12-31',
						createdAt: '2016-02-04',
						updatedAt: null,
					},
				]
			: [],
		address: hasAddress
			? {
					line1: 'Rua Blandina Gomes Junqueira, Loteamento Quinta do Oeste - 123',
					city: 'Franca',
					cityCode: '3516200',
					state: 'SP',
					country: 'BR',
					zip: '14408-194',
				}
			: null,
		identityDocuments,
		credentials: [
			variant === 0
				? { kind: 'email_password', email: 'bruna.dias@playkids.com' }
				: { kind: 'email_password', email: 'rodrigotesteprod@teste.com' },
		],
		subscriptions: buildSubscriptions(variant),
		invoiceReports: [
			{
				id: '9797',
				orderNumber: '40274998',
				subscriptionPeriodId: '20370916',
				subscriptionPeriodStart: '2026-05-01T18:24:52.179413',
				subscriptionPeriodEnd: '2026-06-01T18:24:52.179413',
				transactionId: '5147071',
				isConfirmed: true,
				isSent: true,
				createdAt: '2026-04-30T13:05:10.714332+00:00',
				updatedAt: '2026-04-30T13:05:16.045021+00:00',
			},
			{
				id: '8126',
				orderNumber: '39584776',
				subscriptionPeriodId: '17068133',
				subscriptionPeriodStart: '2026-03-31T18:24:52.179395',
				subscriptionPeriodEnd: '2026-05-01T18:24:52.179413',
				transactionId: '4862109',
				isConfirmed: true,
				isSent: true,
				createdAt: '2026-03-31T18:30:07.577937+00:00',
				updatedAt: '2026-03-31T18:30:20.034620+00:00',
			},
		],
	};
}
