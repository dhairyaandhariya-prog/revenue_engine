'use client';

import {
	BadgeCheckIcon,
	BoxesIcon,
	CreditCardIcon,
	IdCardIcon,
	KeyRoundIcon,
	MapPinIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	UserIcon,
	UsersRoundIcon,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
	CREDENTIAL_KINDS,
	IDENTITY_KINDS,
	PROFILE_CHARACTERS,
	identityKindLabel,
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
	identityDocuments: IdentityDocument[];
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
	identityDocuments: [],
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
	// Credentials are populated from the Herald API, so they are not part of the create form.
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[3fr_7fr]">
				<DetailsCard value={value} onChange={onChange} />
				<IdentityCard value={value} onChange={onChange} />
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

const EMPTY_IDENTITY_DRAFT: IdentityDocument & { _id: string } = {
	_id: '',
	code: '',
	kind: 'cpf',
};

function IdentityCard({ value, onChange }: Props) {
	const [draft, setDraft] = React.useState<typeof EMPTY_IDENTITY_DRAFT>(EMPTY_IDENTITY_DRAFT);
	const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

	function commitDraft() {
		if (!draft.code.trim()) return;
		const doc: IdentityDocument = { code: draft.code.trim(), kind: draft.kind };
		if (editingIndex !== null) {
			onChange((p) => ({
				...p,
				identityDocuments: p.identityDocuments.map((d, i) => (i === editingIndex ? doc : d)),
			}));
			setEditingIndex(null);
		} else {
			onChange((p) => ({ ...p, identityDocuments: [...p.identityDocuments, doc] }));
		}
		setDraft(EMPTY_IDENTITY_DRAFT);
	}

	function startEdit(idx: number) {
		const d = value.identityDocuments[idx];
		if (!d) return;
		setDraft({ _id: String(idx), code: d.code, kind: d.kind });
		setEditingIndex(idx);
	}

	function cancelEdit() {
		setEditingIndex(null);
		setDraft(EMPTY_IDENTITY_DRAFT);
	}

	function removeDocument(idx: number) {
		onChange((p) => ({ ...p, identityDocuments: p.identityDocuments.filter((_, i) => i !== idx) }));
		if (editingIndex === idx) {
			setEditingIndex(null);
			setDraft(EMPTY_IDENTITY_DRAFT);
		}
	}

	return (
		<Card className="h-full">
			<SectionHeader icon={IdCardIcon} title="Identity Document" />
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
					{/* Draft form (left) */}
					<div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
						<FormRow label="Kind">
							<Select
								value={draft.kind}
								onValueChange={(v) => setDraft((d) => ({ ...d, kind: v as IdentityKind }))}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Identity kind" />
								</SelectTrigger>
								<SelectContent>
									{IDENTITY_KINDS.map((k) => (
										<SelectItem key={k.value} value={k.value}>
											{k.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormRow>
						<FormRow label="Identity Code">
							<Input
								value={draft.code}
								onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
							/>
						</FormRow>
						<div className="mt-1 flex items-center gap-2">
							{editingIndex !== null ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-9 flex-1"
									onClick={cancelEdit}
								>
									Cancel
								</Button>
							) : null}
							<Button
								type="button"
								size="sm"
								className="h-9 flex-1 bg-[#224089] text-white hover:bg-[#1b3470] disabled:opacity-50"
								onClick={commitDraft}
								disabled={!draft.code.trim()}
							>
								<PlusIcon />
								{editingIndex !== null ? 'Update' : 'Add'}
							</Button>
						</div>
					</div>

					{/* Documents table (right) */}
					<div
						className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card"
						style={{ contain: 'size', containIntrinsicSize: '0 0' }}
					>
						<div className="min-h-0 flex-1 overflow-auto">
							<Table>
								<TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:bg-muted [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
									<TableRow>
										<TableHead>Identity Code</TableHead>
										<TableHead>Kind</TableHead>
										<TableHead className="w-[100px] text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_tr]:bg-card">
									{value.identityDocuments.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={3}
												className="py-10 text-center text-sm text-muted-foreground"
											>
												No documents yet. Use the form on the left to add one.
											</TableCell>
										</TableRow>
									) : (
										value.identityDocuments.map((d, i) => (
											<TableRow
												key={i}
												data-state={editingIndex === i ? 'selected' : undefined}
											>
												<TableCell className="break-all font-mono text-sm font-medium text-foreground">
													{d.code || <span className="text-muted-foreground/60">—</span>}
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="border-[#4664E1]/30 bg-[#4664E1]/10 uppercase text-[#4664E1]"
													>
														{identityKindLabel(d.kind)}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-1">
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															className="size-8 text-muted-foreground hover:bg-[#224089]/10 hover:text-[#224089]"
															onClick={() => startEdit(i)}
															aria-label={`Edit document ${i + 1}`}
														>
															<PencilIcon />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															className="size-8 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
															onClick={() => removeDocument(i)}
															aria-label={`Delete document ${i + 1}`}
														>
															<Trash2Icon />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
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

const EMPTY_PROFILE_DRAFT: UserProfile = {
	id: '',
	name: '',
	character: 'Kate',
	birthdate: '',
	createdAt: '',
	updatedAt: null,
};

function ProfilesCard({ value, onChange }: Props) {
	const [draft, setDraft] = React.useState<UserProfile>(EMPTY_PROFILE_DRAFT);
	const [editingId, setEditingId] = React.useState<string | null>(null);

	function commitDraft() {
		if (!draft.name.trim()) return;
		if (editingId) {
			onChange((p) => ({
				...p,
				profiles: p.profiles.map((pr) =>
					pr.id === editingId ? { ...draft, id: editingId } : pr,
				),
			}));
			setEditingId(null);
		} else {
			const id = `new-${Date.now()}`;
			onChange((p) => ({
				...p,
				profiles: [...p.profiles, { ...draft, id }],
			}));
		}
		setDraft(EMPTY_PROFILE_DRAFT);
	}

	function startEdit(id: string) {
		const p = value.profiles.find((pr) => pr.id === id);
		if (!p) return;
		setDraft(p);
		setEditingId(id);
	}

	function cancelEdit() {
		setEditingId(null);
		setDraft(EMPTY_PROFILE_DRAFT);
	}

	function removeProfile(id: string) {
		onChange((p) => ({ ...p, profiles: p.profiles.filter((pr) => pr.id !== id) }));
		if (editingId === id) {
			setEditingId(null);
			setDraft(EMPTY_PROFILE_DRAFT);
		}
	}

	return (
		<Card className="h-full">
			<SectionHeader icon={UsersRoundIcon} title="Profiles" />
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
					{/* Draft form (left) */}
					<div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
						<FormRow label="Name">
							<Input
								value={draft.name}
								onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
							/>
						</FormRow>
						<FormRow label="Character">
							<Select
								value={draft.character}
								onValueChange={(v) =>
									setDraft((d) => ({ ...d, character: v as ProfileCharacter }))
								}
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
								value={(draft.birthdate ?? '').slice(0, 10)}
								onChange={(e) => setDraft((d) => ({ ...d, birthdate: e.target.value }))}
							/>
						</FormRow>
						<div className="mt-1 flex items-center gap-2">
							{editingId ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-9 flex-1"
									onClick={cancelEdit}
								>
									Cancel
								</Button>
							) : null}
							<Button
								type="button"
								size="sm"
								className="h-9 flex-1 bg-[#224089] text-white hover:bg-[#1b3470] disabled:opacity-50"
								onClick={commitDraft}
								disabled={!draft.name.trim()}
							>
								<PlusIcon />
								{editingId ? 'Update' : 'Add'}
							</Button>
						</div>
					</div>

					{/* Profiles table (right) */}
					<div
						className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card"
						style={{ contain: 'size', containIntrinsicSize: '0 0' }}
					>
						<div className="min-h-0 flex-1 overflow-auto">
							<Table>
								<TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:bg-muted [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Character</TableHead>
										<TableHead>Birthday</TableHead>
										<TableHead className="w-[100px] text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_tr]:bg-card">
									{value.profiles.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={4}
												className="py-10 text-center text-sm text-muted-foreground"
											>
												No profiles yet. Use the form on the left to add one.
											</TableCell>
										</TableRow>
									) : (
										value.profiles.map((p) => (
											<TableRow
												key={p.id}
												data-state={editingId === p.id ? 'selected' : undefined}
											>
												<TableCell className="text-sm font-medium text-foreground">
													{p.name || <span className="text-muted-foreground/60">—</span>}
												</TableCell>
												<TableCell className="text-sm">{p.character}</TableCell>
												<TableCell className="text-sm">
													{p.birthdate || (
														<span className="text-muted-foreground/60">—</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-1">
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															className="size-8 text-muted-foreground hover:bg-[#224089]/10 hover:text-[#224089]"
															onClick={() => startEdit(p.id)}
															aria-label={`Edit profile ${p.name || ''}`}
														>
															<PencilIcon />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="icon-sm"
															className="size-8 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
															onClick={() => removeProfile(p.id)}
															aria-label={`Delete profile ${p.name || ''}`}
														>
															<Trash2Icon />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
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
