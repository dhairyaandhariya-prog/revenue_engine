'use client';

import {
	BadgeCheckIcon,
	BoxesIcon,
	CreditCardIcon,
	IdCardIcon,
	KeyRoundIcon,
	MapPinIcon,
	PlusIcon,
	Trash2Icon,
	UserIcon,
	UsersRoundIcon,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
	CREDENTIAL_KINDS,
	IDENTITY_KINDS,
	PROFILE_CHARACTERS,
	type CredentialKindValue,
	type IdentityDocument,
	type IdentityKind,
	type PartnerData,
	type ProfileCharacter,
	type UserAddress,
	type UserCredential,
	type UserProfile,
} from '@/lib/user-detail';

export type NewUserFormValue = {
	firstName: string;
	lastName: string;
	kiwiLegacyAccountUuid: string;
	isActive: boolean;
	identityDocument: IdentityDocument;
	credentials: UserCredential[];
	profiles: UserProfile[];
	address: UserAddress;
	partnerData: PartnerData;
};

export const EMPTY_USER_FORM: NewUserFormValue = {
	firstName: '',
	lastName: '',
	kiwiLegacyAccountUuid: '',
	isActive: true,
	identityDocument: { code: '', kind: 'CPF' },
	credentials: [{ kind: 'email_password', email: '' }],
	profiles: [],
	address: { line1: '', city: '', cityCode: '', state: '', country: '', zip: '' },
	partnerData: {},
};

type Props = {
	value: NewUserFormValue;
	onChange: React.Dispatch<React.SetStateAction<NewUserFormValue>>;
};

// ─── shared building blocks ───────────────────────────────────────────

function CardIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
	return (
		<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#224089]/10 text-[#224089]">
			<Icon className="size-[18px] stroke-[2]" />
		</span>
	);
}

function SectionHeader({
	icon,
	title,
	action,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	action?: React.ReactNode;
}) {
	return (
		<>
			<CardHeader className="flex flex-row items-center gap-2.5">
				<CardIcon icon={icon} />
				<CardTitle className="text-base font-semibold leading-snug">{title}</CardTitle>
				{action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
			</CardHeader>
			<div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />
		</>
	);
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

function EmptyHint({
	children,
	tone = 'info',
}: {
	children: React.ReactNode;
	tone?: 'info' | 'warning';
}) {
	return (
		<div
			className={cn(
				'rounded-md border px-3 py-2 text-sm',
				tone === 'warning'
					? 'border-[#FFC101]/30 bg-[#FFC101]/10 text-[#8a6800]'
					: 'border-[#4664E1]/30 bg-[#4664E1]/8 text-[#224089]',
			)}
		>
			{children}
		</div>
	);
}

// ─── credentials helper ──────────────────────────────────────────────

function credentialIdentifierField(
	kind: CredentialKindValue,
): { label: string; key: keyof UserCredential } {
	switch (kind) {
		case 'email_password':
		case 'kiwi_legacy_password':
			return { label: 'Email', key: 'email' };
		case 'apple_login':
			return { label: 'Apple ID', key: 'appleId' };
		case 'phone_number':
			return { label: 'Phone Number', key: 'phoneNumber' };
		case 'generic':
		default:
			return { label: 'Identifier', key: 'identifier' };
	}
}

// ─── exported sections ───────────────────────────────────────────────

export function UserDetailsFormSection({ value, onChange }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<DetailsCard value={value} onChange={onChange} />
				<IdentityCard value={value} onChange={onChange} />
				<CredentialsCard value={value} onChange={onChange} />
			</div>
			<ProfilesCard value={value} onChange={onChange} />
			<AddressCard value={value} onChange={onChange} />
		</div>
	);
}

export function PartnerDataFormSection({ value, onChange }: Props) {
	return (
		<Card>
			<SectionHeader icon={BoxesIcon} title="Partner Data" />
			<CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
				{PARTNER_FIELDS.map(({ key, label }) => (
					<FormRow key={key} label={label}>
						<Input
							value={value.partnerData[key] ?? ''}
							onChange={(e) =>
								onChange((p) => ({
									...p,
									partnerData: { ...p.partnerData, [key]: e.target.value || undefined },
								}))
							}
						/>
					</FormRow>
				))}
			</CardContent>
		</Card>
	);
}

export function SubscriptionPlaceholderSection() {
	return (
		<Card>
			<SectionHeader icon={CreditCardIcon} title="Subscription" />
			<CardContent>
				<EmptyHint>Subscriptions can be added after the user is created.</EmptyHint>
			</CardContent>
		</Card>
	);
}

export function InvoiceReportsPlaceholderSection() {
	return (
		<Card>
			<SectionHeader icon={BadgeCheckIcon} title="Invoice Reports" />
			<CardContent>
				<EmptyHint>
					Invoice reports are generated automatically based on subscription activity.
				</EmptyHint>
			</CardContent>
		</Card>
	);
}

// ─── individual cards ────────────────────────────────────────────────

function DetailsCard({ value, onChange }: Props) {
	return (
		<Card className="h-full">
			<SectionHeader icon={UserIcon} title="Details" />
			<CardContent className="flex flex-col gap-5">
				<FormRow label="First Name" required>
					<Input
						value={value.firstName}
						onChange={(e) => onChange((p) => ({ ...p, firstName: e.target.value }))}
					/>
				</FormRow>
				<FormRow label="Last Name" required>
					<Input
						value={value.lastName}
						onChange={(e) => onChange((p) => ({ ...p, lastName: e.target.value }))}
					/>
				</FormRow>
				<FormRow label="Kiwi Legacy Account UUID">
					<Input
						value={value.kiwiLegacyAccountUuid}
						onChange={(e) => onChange((p) => ({ ...p, kiwiLegacyAccountUuid: e.target.value }))}
						placeholder="00000000-0000-0000-0000-000000000000"
					/>
				</FormRow>
				<FormRow label="Status" required>
					<div className="flex items-center gap-3">
						<Switch
							checked={value.isActive}
							onCheckedChange={(v) => onChange((p) => ({ ...p, isActive: v }))}
						/>
						<span className="text-sm text-muted-foreground">
							{value.isActive ? 'Active' : 'Inactive'}
						</span>
					</div>
				</FormRow>
			</CardContent>
		</Card>
	);
}

function IdentityCard({ value, onChange }: Props) {
	const doc = value.identityDocument;
	return (
		<Card className="h-full">
			<SectionHeader icon={IdCardIcon} title="Identity Document" />
			<CardContent className="flex flex-col gap-5">
				<FormRow label="Identity Code">
					<Input
						value={doc.code}
						onChange={(e) =>
							onChange((p) => ({ ...p, identityDocument: { ...p.identityDocument, code: e.target.value } }))
						}
					/>
				</FormRow>
				<FormRow label="Kind">
					<Select
						value={doc.kind}
						onValueChange={(v) =>
							onChange((p) => ({
								...p,
								identityDocument: { ...p.identityDocument, kind: v as IdentityKind },
							}))
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Identity kind" />
						</SelectTrigger>
						<SelectContent>
							{IDENTITY_KINDS.map((k) => (
								<SelectItem key={k} value={k}>
									{k}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormRow>
			</CardContent>
		</Card>
	);
}

function CredentialsCard({ value, onChange }: Props) {
	function addCredential() {
		onChange((p) => ({
			...p,
			credentials: [...p.credentials, { kind: 'email_password', email: '' }],
		}));
	}
	function removeCredential(idx: number) {
		onChange((p) => ({ ...p, credentials: p.credentials.filter((_, i) => i !== idx) }));
	}
	function updateCredential(idx: number, patch: Partial<UserCredential>) {
		onChange((p) => ({
			...p,
			credentials: p.credentials.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
		}));
	}
	const addBtn = (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="h-8"
			onClick={addCredential}
		>
			<PlusIcon />
			Add
		</Button>
	);
	return (
		<Card
			className="flex h-full flex-col overflow-hidden"
			style={{ contain: 'size', containIntrinsicSize: '0 0' }}
		>
			<SectionHeader icon={KeyRoundIcon} title="Credentials" action={addBtn} />
			<CardContent className="min-h-0 flex-1 overflow-hidden">
				{value.credentials.length === 0 ? (
					<EmptyHint>No credentials yet. Click Add to create one.</EmptyHint>
				) : (
					<ul className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
						{value.credentials.map((c, i) => {
							const idField = credentialIdentifierField(c.kind);
							return (
								<li key={i} className="flex flex-col gap-3 rounded-lg border p-3">
									<div className="flex items-center justify-between border-b pb-3">
										<span className="text-sm font-medium text-muted-foreground">
											Credential {i + 1}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="size-7 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
											onClick={() => removeCredential(i)}
											aria-label={`Remove credential ${i + 1}`}
										>
											<Trash2Icon />
										</Button>
									</div>
									<FormRow label="Kind">
										<Select
											value={c.kind}
											onValueChange={(v) => updateCredential(i, { kind: v as CredentialKindValue })}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Credential kind" />
											</SelectTrigger>
											<SelectContent>
												{CREDENTIAL_KINDS.map((k) => (
													<SelectItem key={k.value} value={k.value}>
														{k.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormRow>
									<FormRow label={idField.label}>
										<Input
											value={(c[idField.key] as string) ?? ''}
											onChange={(e) => updateCredential(i, { [idField.key]: e.target.value })}
										/>
									</FormRow>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

function ProfilesCard({ value, onChange }: Props) {
	function addProfile() {
		onChange((p) => ({
			...p,
			profiles: [
				...p.profiles,
				{
					id: `new-${p.profiles.length + 1}`,
					name: '',
					character: 'Kate',
					birthdate: '',
					createdAt: '',
					updatedAt: null,
				},
			],
		}));
	}
	function removeProfile(idx: number) {
		onChange((p) => ({ ...p, profiles: p.profiles.filter((_, i) => i !== idx) }));
	}
	function updateProfile(idx: number, patch: Partial<UserProfile>) {
		onChange((p) => ({
			...p,
			profiles: p.profiles.map((pr, i) => (i === idx ? { ...pr, ...patch } : pr)),
		}));
	}
	const addBtn = (
		<Button type="button" variant="outline" size="sm" className="h-8" onClick={addProfile}>
			<PlusIcon />
			Add
		</Button>
	);
	return (
		<Card className="h-full">
			<SectionHeader icon={UsersRoundIcon} title="Profiles" action={addBtn} />
			<CardContent>
				{value.profiles.length === 0 ? (
					<EmptyHint>No profiles yet. Click Add to create one.</EmptyHint>
				) : (
					<ul className="flex gap-3 overflow-x-auto pb-2">
						{value.profiles.map((p, i) => (
							<li key={p.id} className="flex w-[280px] shrink-0 flex-col gap-3 rounded-lg border p-3">
								<div className="flex items-center justify-between border-b pb-3">
									<span className="text-sm font-medium text-muted-foreground">
										Profile {i + 1}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="size-7 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
										onClick={() => removeProfile(i)}
										aria-label={`Remove profile ${i + 1}`}
									>
										<Trash2Icon />
									</Button>
								</div>
								<FormRow label="Name">
									<Input value={p.name} onChange={(e) => updateProfile(i, { name: e.target.value })} />
								</FormRow>
								<FormRow label="Character">
									<Select
										value={p.character}
										onValueChange={(v) => updateProfile(i, { character: v as ProfileCharacter })}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Character" />
										</SelectTrigger>
										<SelectContent>
											{PROFILE_CHARACTERS.map((c) => (
												<SelectItem key={c} value={c}>
													{c}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormRow>
								<FormRow label="Birthday">
									<Input
										type="date"
										value={p.birthdate.slice(0, 10)}
										onChange={(e) => updateProfile(i, { birthdate: e.target.value })}
									/>
								</FormRow>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

const ADDRESS_FIELDS: { key: keyof UserAddress; label: string }[] = [
	{ key: 'line1', label: 'Line 1' },
	{ key: 'city', label: 'City' },
	{ key: 'cityCode', label: 'City Code' },
	{ key: 'state', label: 'State' },
	{ key: 'country', label: 'Country' },
	{ key: 'zip', label: 'Zip Code' },
];

function AddressCard({ value, onChange }: Props) {
	return (
		<Card className="h-full">
			<SectionHeader icon={MapPinIcon} title="Address" />
			<CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
				{ADDRESS_FIELDS.map(({ key, label }) => (
					<FormRow key={key} label={label}>
						<Input
							value={value.address[key]}
							onChange={(e) =>
								onChange((p) => ({ ...p, address: { ...p.address, [key]: e.target.value } }))
							}
						/>
					</FormRow>
				))}
			</CardContent>
		</Card>
	);
}

const PARTNER_FIELDS: { key: keyof PartnerData; label: string }[] = [
	{ key: 'stripeCustomerId', label: 'Stripe Customer ID' },
	{ key: 'vindiCustomerId', label: 'Vindi Customer ID' },
	{ key: 'vizioCustomerId', label: 'Vizio Customer ID' },
	{ key: 'minuUserIdentity', label: 'Minu User Identity' },
	{ key: 'wisterUserId', label: 'Wister User ID' },
	{ key: 'samsungGalaxyStoreAccountId', label: 'Samsung Galaxy Store Account ID' },
	{ key: 'samsungTvCustomerId', label: 'Samsung TV Customer ID' },
	{ key: 'sankhyaUserId', label: 'Sankhya User ID' },
	{ key: 'lgUserId', label: 'LG User ID' },
];
