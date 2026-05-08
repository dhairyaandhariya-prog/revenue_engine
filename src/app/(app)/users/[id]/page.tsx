'use client';

import {
	BadgeCheckIcon,
	BoxesIcon,
	CalendarIcon,
	CheckIcon,
	CreditCardIcon,
	IdCardIcon,
	KeyRoundIcon,
	MapPinIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
	UserIcon,
	UsersRoundIcon,
	XIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
	CREDENTIAL_KINDS,
	IDENTITY_KINDS,
	PROFILE_CHARACTERS,
	getUserDetail,
	identityKindLabel,
	type CredentialKindValue,
	type IdentityDocument,
	type IdentityKind,
	type InvoiceReport,
	type PartnerData,
	type ProfileCharacter,
	type UserAddress,
	type UserCredential,
	type UserDetail,
	type UserProfile,
} from '@/lib/user-detail';

type Params = Promise<{ id: string }>;

type LayoutMode = 'merged' | 'tabs-old' | 'bento-old' | 'compact';

// Iteration mapping (rows ordered ascending by ID; default sort is ascending).
// 932303 (row 3): compact field layout (multi-column grids inside Details / Address)
// 932311 (row 11): old 8-tab layout (empty state demo)
// 932312 (row 12): old bento mosaic layout (fully filled state demo)
const LAYOUT_OVERRIDES: Record<string, LayoutMode> = {
	'932303': 'compact',
	'932311': 'tabs-old',
	'932312': 'bento-old',
};

const tabTriggerClass = 'data-active:text-[#224089] after:bg-[#224089] dark:data-active:text-[#4664E1]';

const TABS = [
	{ value: 'user-details', label: 'User Details' },
	{ value: 'partner-data', label: 'Partner Data' },
	{ value: 'subscription', label: 'Subscription' },
	{ value: 'invoice-reports', label: 'Invoice Reports' },
] as const;

const TABS_OLD = [
	{ value: 'details', label: 'Details' },
	{ value: 'partner-data', label: 'Partner Data' },
	{ value: 'profiles', label: 'Profiles' },
	{ value: 'address', label: 'Address' },
	{ value: 'identity', label: 'Identity Document' },
	{ value: 'credentials', label: 'Credentials' },
	{ value: 'subscriptions', label: 'Subscriptions' },
	{ value: 'invoice-reports', label: 'Invoice Reports' },
] as const;

export default function UserDetailPage({ params }: { params: Params }) {
	const { id } = React.use(params);
	const initial = React.useMemo(() => getUserDetail(id), [id]);
	const searchParams = useSearchParams();
	const editParam = searchParams.get('edit') === '1';

	const [user, setUser] = React.useState<UserDetail>(initial);
	const [editing, setEditing] = React.useState(editParam);
	const [snapshot, setSnapshot] = React.useState<UserDetail | null>(editParam ? initial : null);
	const [activeTab, setActiveTab] = React.useState<string>('user-details');

	const scrollerRef = React.useRef<HTMLElement | null>(null);
	const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});
	const isClickScrollingRef = React.useRef(false);
	const clickScrollTimerRef = React.useRef<number | null>(null);

	React.useEffect(() => {
		setUser(initial);
		setEditing(editParam);
		setSnapshot(editParam ? initial : null);
		setActiveTab('user-details');
	}, [initial, editParam]);

	function startEdit() {
		setSnapshot(user);
		setEditing(true);
	}
	function saveEdit() {
		setUser((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
		setSnapshot(null);
		setEditing(false);
	}
	function cancelEdit() {
		if (snapshot) setUser(snapshot);
		setSnapshot(null);
		setEditing(false);
	}

	const layoutMode: LayoutMode = LAYOUT_OVERRIDES[id] ?? 'merged';
	const isMergedLike = layoutMode === 'merged' || layoutMode === 'compact';
	const isCompact = layoutMode === 'compact';
	const isScrollSpy = isMergedLike && editing;

	const setSectionRef = (key: string) => (el: HTMLElement | null) => {
		sectionRefs.current[key] = el;
	};

	function handleTabChange(val: string) {
		setActiveTab(val);
		const target = sectionRefs.current[val];
		const root = scrollerRef.current;
		if (!target || !root) return;
		isClickScrollingRef.current = true;
		const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 80;
		root.scrollTo({ top: Math.max(0, top) });
		if (clickScrollTimerRef.current) window.clearTimeout(clickScrollTimerRef.current);
		clickScrollTimerRef.current = window.setTimeout(() => {
			isClickScrollingRef.current = false;
		}, 800);
	}

	React.useEffect(() => {
		if (!isScrollSpy) return;
		const root = scrollerRef.current;
		if (!root) return;
		const ids = TABS.map((t) => t.value);
		function update() {
			if (isClickScrollingRef.current) return;
			const rootEl = root!;
			if (rootEl.scrollTop + rootEl.clientHeight >= rootEl.scrollHeight - 4) {
				const last = ids[ids.length - 1];
				setActiveTab((cur) => (cur === last ? cur : last));
				return;
			}
			const rootRect = rootEl.getBoundingClientRect();
			const offset = rootRect.top + 120;
			let nextId: string = ids[0];
			for (const id of ids) {
				const el = sectionRefs.current[id];
				if (!el) continue;
				const r = el.getBoundingClientRect();
				if (r.top <= offset) nextId = id;
				else break;
			}
			setActiveTab((cur) => (cur === nextId ? cur : nextId));
		}
		root.addEventListener('scroll', update, { passive: true });
		update();
		return () => {
			root.removeEventListener('scroll', update);
		};
	}, [isScrollSpy]);

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'User Management' },
					{ label: 'Users', href: '/users' },
					{ label: id },
				]}
			/>
			{isScrollSpy ? (
				<main
					ref={scrollerRef}
					className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-auto"
				>
					<div className="px-6 pt-6 pb-2">
						<DetailHeader
							user={user}
							editing={editing}
							onEdit={startEdit}
							onSave={saveEdit}
							onCancel={cancelEdit}
						/>
					</div>
					<div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
						<Tabs value={activeTab} onValueChange={handleTabChange}>
							<TabsList variant="line" className="scrollbar-hidden !h-11 -mx-1 gap-2 overflow-x-auto px-1">
								{TABS.map((t) => (
									<TabsTrigger key={t.value} value={t.value} className={cn('px-3 text-sm', tabTriggerClass)}>
										{t.label}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
					<div className="flex flex-col gap-6 px-6 py-6">
						<section
							id="user-details"
							ref={setSectionRef('user-details')}
							className="scroll-mt-24"
							aria-label="User Details"
						>
							<UserDetailsTab user={user} setUser={setUser} editing />
						</section>
						<section
							id="partner-data"
							ref={setSectionRef('partner-data')}
							className="scroll-mt-24"
							aria-label="Partner Data"
						>
							<PartnerDataCard user={user} setUser={setUser} editing />
						</section>
						<section
							id="subscription"
							ref={setSectionRef('subscription')}
							className="scroll-mt-24"
							aria-label="Subscription"
						>
							<SubscriptionsCard user={user} />
						</section>
						<section
							id="invoice-reports"
							ref={setSectionRef('invoice-reports')}
							className="scroll-mt-24"
							aria-label="Invoice Reports"
						>
							<InvoiceReportsCard user={user} />
						</section>
					</div>
				</main>
			) : (
				<main className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-6">
					<DetailHeader
						user={user}
						editing={editing}
						onEdit={startEdit}
						onSave={saveEdit}
						onCancel={cancelEdit}
					/>

					{layoutMode === 'tabs-old' ? (
						<TabsLayoutOld user={user} setUser={setUser} editing={editing} />
					) : layoutMode === 'bento-old' ? (
						<BentoLayoutOld user={user} setUser={setUser} editing={editing} />
					) : (
						<Tabs defaultValue="user-details" className="gap-4">
							<TabsList variant="line" className="scrollbar-hidden !h-11 -mx-1 gap-2 overflow-x-auto px-1">
								{TABS.map((t) => (
									<TabsTrigger key={t.value} value={t.value} className={cn('px-3 text-sm', tabTriggerClass)}>
										{t.label}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent value="user-details">
								<UserDetailsTab user={user} setUser={setUser} editing={editing} compact={isCompact} />
							</TabsContent>
							<TabsContent value="subscription">
								<SubscriptionsCard user={user} />
							</TabsContent>
							<TabsContent value="partner-data">
								<PartnerDataCard user={user} setUser={setUser} editing={editing} />
							</TabsContent>
							<TabsContent value="invoice-reports">
								<InvoiceReportsCard user={user} />
							</TabsContent>
						</Tabs>
					)}
				</main>
			)}
		</>
	);
}

// ───────────────────────────── header ─────────────────────────────

function DetailHeader({
	user,
	editing,
	onEdit,
	onSave,
	onCancel,
}: {
	user: UserDetail;
	editing: boolean;
	onEdit: () => void;
	onSave: () => void;
	onCancel: () => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-semibold tracking-tight">User #{user.id}</h1>
					<Badge
						variant="outline"
						className={cn(
							'gap-1.5',
							user.isActive
								? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
								: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
						)}
					>
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: user.isActive ? '#00B86E' : '#E8536A' }}
						/>
						{user.isActive ? 'Active' : 'Inactive'}
					</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
					Last Modified:{' '}
					<span className="text-foreground">
						{user.updatedAt ? formatTimestamp(user.updatedAt) : '—'}
					</span>
					<span className="mx-2 text-muted-foreground/40">·</span>
					Created: <span className="text-foreground">{formatTimestamp(user.createdAt)}</span>
				</p>
			</div>
			{editing ? (
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" className="h-9" onClick={onCancel}>
						<XIcon />
						Cancel
					</Button>
					<Button size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]" onClick={onSave}>
						<CheckIcon />
						Save
					</Button>
				</div>
			) : (
				<Button size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]" onClick={onEdit}>
					<PencilIcon />
					Edit
				</Button>
			)}
		</div>
	);
}

// ───────────────────────────── User Details tab layout ─────────────────────────────

type LayoutProps = {
	user: UserDetail;
	setUser: React.Dispatch<React.SetStateAction<UserDetail>>;
	editing: boolean;
};

function UserDetailsTab({
	user,
	setUser,
	editing,
	compact = false,
}: LayoutProps & { compact?: boolean }) {
	if (editing) {
		// Edit mode: Details + Identity + Credentials in one row; Profiles + Address full width below.
		return (
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<DetailsCard user={user} setUser={setUser} editing={editing} />
					<IdentityCard user={user} setUser={setUser} editing={editing} />
					<CredentialsCard user={user} setUser={setUser} editing={editing} />
				</div>
				<ProfilesCard user={user} setUser={setUser} editing={editing} />
				<AddressCard user={user} setUser={setUser} editing={editing} />
			</div>
		);
	}
	return (
		<div className="grid grid-cols-12 gap-4">
			<div className="col-span-12 md:col-span-7">
				<DetailsCard user={user} setUser={setUser} editing={editing} compact={compact} />
			</div>
			<div className="col-span-12 flex flex-col gap-4 md:col-span-5">
				<IdentityCard user={user} setUser={setUser} editing={editing} />
				<CredentialsCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 md:col-span-6">
				<AddressCard user={user} setUser={setUser} editing={editing} compact={compact} />
			</div>
			<div className="col-span-12 md:col-span-6">
				<ProfilesCard user={user} setUser={setUser} editing={editing} />
			</div>
		</div>
	);
}

// ───────────────────────────── old tabs layout (8 tabs) ─────────────────────────────

function TabsLayoutOld({ user, setUser, editing }: LayoutProps) {
	return (
		<Tabs defaultValue="details" className="gap-4">
			<TabsList variant="line" className="-mx-1 gap-2 overflow-x-auto px-1">
				{TABS_OLD.map((t) => (
					<TabsTrigger key={t.value} value={t.value} className={cn('px-3 text-sm', tabTriggerClass)}>
						{t.label}
					</TabsTrigger>
				))}
			</TabsList>

			<TabsContent value="details">
				<DetailsCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="partner-data">
				<PartnerDataCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="profiles">
				<ProfilesCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="address">
				<AddressCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="identity">
				<IdentityCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="credentials">
				<CredentialsCard user={user} setUser={setUser} editing={editing} />
			</TabsContent>
			<TabsContent value="subscriptions">
				<SubscriptionsCard user={user} legacy />
			</TabsContent>
			<TabsContent value="invoice-reports">
				<InvoiceReportsCard user={user} legacy />
			</TabsContent>
		</Tabs>
	);
}

// ───────────────────────────── old bento layout (mosaic) ─────────────────────────────

function BentoLayoutOld({ user, setUser, editing }: LayoutProps) {
	return (
		<div className="grid grid-cols-12 gap-4">
			<div className="col-span-12 lg:col-span-8">
				<DetailsCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<QuickStatsCard user={user} />
			</div>
			<div className="col-span-12 lg:col-span-8">
				<SubscriptionsCard user={user} legacy />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<ProfilesCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<AddressCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<IdentityCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<CredentialsCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-8">
				<PartnerDataCard user={user} setUser={setUser} editing={editing} />
			</div>
			<div className="col-span-12 lg:col-span-4">
				<InvoiceReportsCard user={user} legacy />
			</div>
		</div>
	);
}

function QuickStatsCard({ user }: { user: UserDetail }) {
	const stats = [
		{ label: 'Status', value: user.isActive ? 'Active' : 'Inactive', icon: BadgeCheckIcon, tone: user.isActive ? 'green' : 'rose' },
		{ label: 'Subscriptions', value: user.subscriptions.length.toString(), icon: CreditCardIcon, tone: 'blue' },
		{ label: 'Profiles', value: user.profiles.length.toString(), icon: UsersRoundIcon, tone: 'blue' },
		{ label: 'Created', value: formatTimestamp(user.createdAt).slice(0, 10), icon: CalendarIcon, tone: 'neutral' },
	] as const;
	const toneClass: Record<typeof stats[number]['tone'], string> = {
		green: 'bg-[#00B86E]/10 text-[#00B86E]',
		rose: 'bg-[#E8536A]/10 text-[#E8536A]',
		blue: 'bg-[#4664E1]/10 text-[#4664E1]',
		neutral: 'bg-muted text-foreground/70',
	};
	return (
		<Card className="h-full">
			<SectionHeader icon={BadgeCheckIcon} title="At a glance" />
			<CardContent className="grid grid-cols-2 gap-3">
				{stats.map((s) => (
					<div key={s.label} className="flex items-center gap-3 rounded-lg border p-3">
						<span className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', toneClass[s.tone])}>
							<s.icon className="size-4" />
						</span>
						<span className="flex min-w-0 flex-col">
							<span className="text-xs text-muted-foreground">{s.label}</span>
							<span className="truncate text-sm font-medium">{s.value}</span>
						</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── shared building blocks ─────────────────────────────

type EditableCardProps = {
	user: UserDetail;
	setUser?: React.Dispatch<React.SetStateAction<UserDetail>>;
	editing: boolean;
};

type ReadOnlyCardProps = { user: UserDetail; legacy?: boolean };

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

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="text-sm font-medium text-foreground">{children}</span>
		</div>
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

function NA() {
	return <span className="text-muted-foreground/60">N/A</span>;
}

function dateOnly(s: string | null | undefined) {
	if (!s) return '';
	return s.slice(0, 10);
}

// ───────────────────────────── Details ─────────────────────────────

function DetailsCard({
	user,
	setUser,
	editing,
	compact = false,
}: EditableCardProps & { compact?: boolean }) {
	const showCompact = compact && !editing;
	return (
		<Card className="h-full">
			<SectionHeader icon={UserIcon} title="Details" />
			<CardContent
				className={cn(
					showCompact ? 'grid grid-cols-2 gap-x-6 gap-y-5' : 'flex flex-col gap-5',
				)}
			>
				{editing && setUser ? (
					<>
						<FormRow label="First Name">
							<Input
								value={user.firstName ?? ''}
								onChange={(e) => setUser((p) => ({ ...p, firstName: e.target.value || null }))}
							/>
						</FormRow>
						<FormRow label="Last Name">
							<Input
								value={user.lastName ?? ''}
								onChange={(e) => setUser((p) => ({ ...p, lastName: e.target.value || null }))}
							/>
						</FormRow>
						<FormRow label="Kiwi Legacy Account UUID">
							<Input
								value={user.kiwiLegacyAccountUuid ?? ''}
								onChange={(e) =>
									setUser((p) => ({ ...p, kiwiLegacyAccountUuid: e.target.value || null }))
								}
								placeholder="00000000-0000-0000-0000-000000000000"
							/>
						</FormRow>
						<FormRow label="Is Active">
							<label className="flex items-center gap-2 text-sm">
								<Checkbox
									checked={user.isActive}
									onCheckedChange={(v) => setUser((p) => ({ ...p, isActive: v === true }))}
								/>
								<span>{user.isActive ? 'Active' : 'Inactive'}</span>
							</label>
						</FormRow>
					</>
				) : (
					<>
						<ReadField label="ID">
							<span className="text-[#224089]">{user.id}</span>
						</ReadField>
						<ReadField label="First Name">{user.firstName ?? <NA />}</ReadField>
						<ReadField label="Last Name">{user.lastName ?? <NA />}</ReadField>
						<div className={cn(showCompact && 'col-span-2')}>
							<ReadField label="Kiwi Legacy Account UUID">
								{user.kiwiLegacyAccountUuid ? (
									<span className="font-mono break-all">{user.kiwiLegacyAccountUuid}</span>
								) : (
									<NA />
								)}
							</ReadField>
						</div>
						<ReadField label="Created">{formatTimestamp(user.createdAt)}</ReadField>
						<ReadField label="Updated">
							{user.updatedAt ? formatTimestamp(user.updatedAt) : <NA />}
						</ReadField>
					</>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Partner Data ─────────────────────────────

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

function PartnerDataCard({ user, setUser, editing }: EditableCardProps) {
	return (
		<Card className="h-full">
			<SectionHeader icon={BoxesIcon} title="Partner Data" />
			<CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
				{editing && setUser
					? PARTNER_FIELDS.map(({ key, label }) => (
							<FormRow key={key} label={label}>
								<Input
									value={user.partnerData[key] ?? ''}
									onChange={(e) =>
										setUser((p) => ({
											...p,
											partnerData: { ...p.partnerData, [key]: e.target.value || undefined },
										}))
									}
								/>
							</FormRow>
						))
					: PARTNER_FIELDS.map(({ key, label }) => (
							<ReadField key={key} label={label}>
								{user.partnerData[key] ?? <NA />}
							</ReadField>
						))}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Profiles ─────────────────────────────

const PROFILE_AVATARS: { src: string; emoji: string; bg: string }[] = [
	{ src: '/avatars/avatar-1.png', emoji: '🐸', bg: 'linear-gradient(135deg, #B7DDB0 0%, #6FA86A 100%)' },
	{ src: '/avatars/avatar-2.png', emoji: '🐶', bg: 'linear-gradient(135deg, #F4C8D4 0%, #C683A6 100%)' },
	{ src: '/avatars/avatar-3.png', emoji: '🐶', bg: 'linear-gradient(135deg, #F7E0A6 0%, #C29347 100%)' },
	{ src: '/avatars/avatar-4.png', emoji: '🐱', bg: 'linear-gradient(135deg, #C8B8E1 0%, #6E5B9A 100%)' },
	{ src: '/avatars/avatar-5.png', emoji: '🐰', bg: 'linear-gradient(135deg, #F4DD7C 0%, #B58721 100%)' },
];

function ProfileAvatar({ index, name }: { index: number; name: string }) {
	const a = PROFILE_AVATARS[index % PROFILE_AVATARS.length];
	return (
		<span
			aria-label={name}
			className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl"
			style={{ background: a.bg }}
		>
			<span aria-hidden>{a.emoji}</span>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={a.src} alt="" className="absolute inset-0 size-full object-cover" />
		</span>
	);
}

function ProfilesCard({ user, setUser, editing }: EditableCardProps) {
	function updateProfile(idx: number, patch: Partial<UserProfile>) {
		setUser?.((p) => ({
			...p,
			profiles: p.profiles.map((pr, i) => (i === idx ? { ...pr, ...patch } : pr)),
		}));
	}

	return (
		<Card className="h-full">
			<SectionHeader icon={UsersRoundIcon} title="Profiles" />
			<CardContent>
				{editing && setUser ? (
					user.profiles.length === 0 ? (
						<EmptyHint>No profiles found for this user.</EmptyHint>
					) : (
						<ul className="flex gap-3 overflow-x-auto pb-2">
							{user.profiles.map((p, i) => (
								<li key={p.id} className="flex w-[280px] shrink-0 flex-col gap-3 rounded-lg border p-3">
									<div className="flex items-center gap-3 border-b pb-3">
										<ProfileAvatar index={i} name={p.name} />
										<span className="text-sm font-medium text-muted-foreground">Profile {i + 1}</span>
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
											value={dateOnly(p.birthdate)}
											onChange={(e) => updateProfile(i, { birthdate: e.target.value })}
										/>
									</FormRow>
									<FormRow label="Created at">
										<Input
											type="date"
											value={dateOnly(p.createdAt)}
											onChange={(e) => updateProfile(i, { createdAt: e.target.value })}
										/>
									</FormRow>
									<FormRow label="Updated at">
										<Input
											type="date"
											value={dateOnly(p.updatedAt)}
											onChange={(e) => updateProfile(i, { updatedAt: e.target.value || null })}
										/>
									</FormRow>
								</li>
							))}
						</ul>
					)
				) : user.profiles.length === 0 ? (
					<EmptyHint>No profiles found for this user.</EmptyHint>
				) : (
					<ul className="flex flex-col divide-y divide-border">
						{user.profiles.map((p, i) => (
							<li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
								<ProfileAvatar index={i} name={p.name} />
								<div className="flex flex-1 flex-col">
									<span className="text-base font-medium text-[#224089]">{p.name}</span>
									<span className="text-sm text-muted-foreground">
										{p.character} · {p.birthdate}
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Address ─────────────────────────────

const ADDRESS_FIELDS: { key: keyof UserAddress; label: string }[] = [
	{ key: 'line1', label: 'Line 1' },
	{ key: 'city', label: 'City' },
	{ key: 'cityCode', label: 'City Code' },
	{ key: 'state', label: 'State' },
	{ key: 'country', label: 'Country' },
	{ key: 'zip', label: 'Zip Code' },
];

const EMPTY_ADDRESS: UserAddress = {
	line1: '',
	city: '',
	cityCode: '',
	state: '',
	country: '',
	zip: '',
};

function AddressCard({
	user,
	setUser,
	editing,
	compact = false,
}: EditableCardProps & { compact?: boolean }) {
	const a = user.address ?? EMPTY_ADDRESS;
	const showCompact = compact && !editing && !!user.address;
	return (
		<Card className="h-full">
			<SectionHeader icon={MapPinIcon} title="Address" />
			<CardContent>
				{editing && setUser ? (
					<div className="flex flex-col gap-5">
						{ADDRESS_FIELDS.map(({ key, label }) => (
							<FormRow key={key} label={label}>
								<Input
									value={a[key]}
									onChange={(e) =>
										setUser((p) => ({
											...p,
											address: { ...(p.address ?? EMPTY_ADDRESS), [key]: e.target.value },
										}))
									}
								/>
							</FormRow>
						))}
					</div>
				) : !user.address ? (
					<EmptyHint tone="warning">User Address is missing.</EmptyHint>
				) : showCompact ? (
					<div className="grid grid-cols-3 gap-x-6 gap-y-5">
						<div className="col-span-3">
							<ReadField label="Line 1">{user.address?.line1 || <NA />}</ReadField>
						</div>
						<ReadField label="City">{user.address?.city || <NA />}</ReadField>
						<ReadField label="City Code">{user.address?.cityCode || <NA />}</ReadField>
						<ReadField label="Zip Code">{user.address?.zip || <NA />}</ReadField>
						<ReadField label="State">{user.address?.state || <NA />}</ReadField>
						<ReadField label="Country">{user.address?.country || <NA />}</ReadField>
					</div>
				) : (
					<div className="flex flex-col gap-5">
						{ADDRESS_FIELDS.map(({ key, label }) => (
							<ReadField key={key} label={label}>
								{user.address?.[key] || <NA />}
							</ReadField>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Identity Document ─────────────────────────────

function IdentityCard({ user, setUser, editing }: EditableCardProps) {
	function addDocument() {
		setUser?.((p) => ({
			...p,
			identityDocuments: [...p.identityDocuments, { code: '', kind: 'cpf' as IdentityKind }],
		}));
	}
	function removeDocument(idx: number) {
		setUser?.((p) => ({
			...p,
			identityDocuments: p.identityDocuments.filter((_, i) => i !== idx),
		}));
	}
	function updateDocument(idx: number, patch: Partial<IdentityDocument>) {
		setUser?.((p) => ({
			...p,
			identityDocuments: p.identityDocuments.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
		}));
	}
	const addBtn =
		editing && setUser ? (
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-8"
				onClick={addDocument}
			>
				<PlusIcon />
				Add
			</Button>
		) : undefined;
	return (
		<Card
			className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
			style={{ contain: 'size', containIntrinsicSize: '0 0' }}
		>
			<SectionHeader icon={IdCardIcon} title="Identity Document" action={addBtn} />
			<CardContent className="min-h-0 flex-1 overflow-hidden">
				{editing && setUser ? (
					user.identityDocuments.length === 0 ? (
						<EmptyHint>No documents yet. Click Add to create one.</EmptyHint>
					) : (
						<ul className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
							{user.identityDocuments.map((d, i) => (
								<li key={i} className="flex flex-col gap-3 rounded-lg border p-3">
									<div className="flex items-center justify-between border-b pb-3">
										<span className="text-sm font-medium text-muted-foreground">
											Document {i + 1}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											className="size-7 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
											onClick={() => removeDocument(i)}
											aria-label={`Remove document ${i + 1}`}
										>
											<Trash2Icon />
										</Button>
									</div>
									<FormRow label="Kind">
										<Select
											value={d.kind}
											onValueChange={(v) => updateDocument(i, { kind: v as IdentityKind })}
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
											value={d.code}
											onChange={(e) => updateDocument(i, { code: e.target.value })}
										/>
									</FormRow>
								</li>
							))}
						</ul>
					)
				) : user.identityDocuments.length === 0 ? (
					<EmptyHint tone="warning">Identity Document is missing.</EmptyHint>
				) : (
					<ul className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
						{user.identityDocuments.map((d, i) => (
							<li
								key={i}
								className="flex shrink-0 items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
							>
								<span className="break-all font-mono text-sm font-medium text-foreground">
									{d.code}
								</span>
								<Badge
									variant="outline"
									className="shrink-0 border-[#4664E1]/30 bg-[#4664E1]/10 uppercase text-[#4664E1]"
								>
									{identityKindLabel(d.kind)}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Credentials ─────────────────────────────

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

function CredentialsCard({ user, setUser, editing }: EditableCardProps) {
	function updateCredential(idx: number, patch: Partial<UserCredential>) {
		setUser?.((p) => ({
			...p,
			credentials: p.credentials.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
		}));
	}

	return (
		<Card
			className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
			style={{ contain: 'size', containIntrinsicSize: '0 0' }}
		>
			<SectionHeader icon={KeyRoundIcon} title="Credentials" />
			<CardContent className="min-h-0 flex-1 overflow-hidden">
				{editing && setUser ? (
					user.credentials.length === 0 ? (
						<EmptyHint>No credentials found for this user.</EmptyHint>
					) : (
						<ul className="flex h-full flex-col divide-y divide-border overflow-y-auto pr-1">
							{user.credentials.map((c, i) => {
								const idField = credentialIdentifierField(c.kind);
								return (
									<li key={i} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
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
					)
				) : user.credentials.length === 0 ? (
					<EmptyHint>No credentials found for this user.</EmptyHint>
				) : (
					<ul className="flex h-full flex-col divide-y divide-border overflow-y-auto pr-1">
						{user.credentials.map((c, i) => {
							const idField = credentialIdentifierField(c.kind);
							const value = c[idField.key] as string | undefined;
							return (
								<li key={i} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
									<ReadField label="Kind">
										<Badge
											variant="outline"
											className="border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]"
										>
											{CREDENTIAL_KINDS.find((k) => k.value === c.kind)?.label ?? c.kind}
										</Badge>
									</ReadField>
									{value ? <ReadField label={idField.label}>{value}</ReadField> : null}
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Subscriptions ─────────────────────────────

function SubscriptionsCard({ user, legacy }: ReadOnlyCardProps) {
	return (
		<Card className="h-full">
			<SectionHeader icon={CreditCardIcon} title="Subscriptions" />
			<CardContent>
				{user.subscriptions.length === 0 ? (
					<EmptyHint>No subscriptions found for this user.</EmptyHint>
				) : (
					<ul className="flex flex-col divide-y divide-border">
						{user.subscriptions.map((s) => (
							<li key={s.id} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-base">
											Subscription ID:{' '}
											<span className="font-semibold text-[#224089]">{s.id}</span>
										</span>
										<Badge
											variant="outline"
											className="rounded-full border-border bg-muted/60 text-foreground/80"
										>
											{s.kind}
										</Badge>
										<Badge
											variant="outline"
											className={cn(
												'gap-1.5 rounded-full',
												s.status === 'active'
													? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
													: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
											)}
										>
											<span
												className="size-1.5 rounded-full"
												style={{ backgroundColor: s.status === 'active' ? '#00B86E' : '#E8536A' }}
											/>
											{s.status}
										</Badge>
									</div>
									<div className="flex shrink-0 flex-wrap items-center gap-2">
										<Button variant="outline" size="sm" className="h-8">
											Re-Verify Subscription
										</Button>
										<Button
											size="sm"
											className="h-8 bg-[#224089] text-white hover:bg-[#1b3470]"
										>
											Create Subscription Period
										</Button>
									</div>
								</div>
								<div className="text-sm">
									<span className="font-medium text-muted-foreground">Expires at:</span>{' '}
									<span className="text-foreground">{formatTimestamp(s.expiresAt)}</span>
								</div>
								<div className="flex flex-col gap-2">
									<span className="text-sm font-medium text-foreground">Subscription Period:</span>
									{legacy ? (
										s.periods.length === 0 ? (
											<span className="text-sm italic text-muted-foreground">
												No periods recorded yet.
											</span>
										) : (
											<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
												{s.periods.map((p) => (
													<div
														key={p.id}
														className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 text-sm"
													>
														<div className="flex items-baseline gap-1.5">
															<span className="font-medium text-muted-foreground">ID:</span>
															<span className="font-semibold text-[#224089]">{p.id}</span>
														</div>
														<div className="flex flex-col gap-0.5 text-foreground">
															<span>{formatTimestamp(p.startsAt)}</span>
															<span>{formatTimestamp(p.endsAt)}</span>
														</div>
														<div className="flex flex-col gap-0.5">
															<span className="text-xs font-medium text-muted-foreground">
																Transaction ID
															</span>
															<span className="break-all text-foreground">
																{p.transactionId ?? (
																	<span className="text-muted-foreground/60">—</span>
																)}
															</span>
														</div>
													</div>
												))}
											</div>
										)
									) : (
										<div className="overflow-hidden rounded-lg border bg-card">
											<Table>
												<TableHeader className="[&_th]:border-b [&_th]:bg-muted [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
													<TableRow>
														<TableHead className="w-[120px]">ID</TableHead>
														<TableHead>Start Date</TableHead>
														<TableHead>End Date</TableHead>
														<TableHead>Transaction ID</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_tr]:bg-card">
													{s.periods.length === 0 ? (
														<TableRow>
															<TableCell
																colSpan={4}
																className="py-6 text-center text-sm italic text-muted-foreground"
															>
																No periods recorded yet.
															</TableCell>
														</TableRow>
													) : (
														s.periods.map((p) => (
															<TableRow key={p.id}>
																<TableCell className="text-sm font-semibold text-[#224089]">
																	{p.id}
																</TableCell>
																<TableCell className="text-sm text-foreground">
																	{formatTimestamp(p.startsAt)}
																</TableCell>
																<TableCell className="text-sm text-foreground">
																	{formatTimestamp(p.endsAt)}
																</TableCell>
																<TableCell className="break-all font-mono text-sm text-foreground">
																	{p.transactionId ?? (
																		<span className="text-muted-foreground/60">—</span>
																	)}
																</TableCell>
															</TableRow>
														))
													)}
												</TableBody>
											</Table>
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

// ───────────────────────────── Invoice Reports ─────────────────────────────

function InvoiceReportsCard({ user, legacy }: ReadOnlyCardProps) {
	if (legacy) {
		return (
			<Card className="h-full">
				<SectionHeader icon={BadgeCheckIcon} title="Invoice Reports" />
				<CardContent>
					{user.invoiceReports.length === 0 ? (
						<EmptyHint>No invoice reports found for this user.</EmptyHint>
					) : (
						<ul className="flex flex-col divide-y divide-border">
							{user.invoiceReports.map((r) => (
								<li key={r.id} className="py-4 first:pt-0 last:pb-0">
									<div className="flex flex-col gap-2">
										<div className="text-sm">
											<span className="font-medium">Invoice Report ID:</span>{' '}
											<span className="font-medium text-[#224089]">{r.id}</span>
										</div>
										<dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
											<LegacyKV label="Order Number" value={r.orderNumber} />
											<LegacyKV
												label="Subscription Period ID"
												value={<span className="text-[#224089]">{r.subscriptionPeriodId}</span>}
											/>
											<LegacyKV
												label="Subscription Period"
												value={`${formatTimestamp(r.subscriptionPeriodStart)} – ${formatTimestamp(r.subscriptionPeriodEnd)}`}
												span={2}
											/>
											<LegacyKV label="Transaction ID" value={r.transactionId} />
											<LegacyKV
												label="Is Confirmed"
												value={
													r.isConfirmed ? (
														<span className="font-semibold text-[#00B86E]">✓</span>
													) : (
														<span className="font-semibold text-[#E8536A]">✕</span>
													)
												}
											/>
											<LegacyKV
												label="Is Sent"
												value={
													r.isSent ? (
														<span className="font-semibold text-[#00B86E]">✓</span>
													) : (
														<span className="font-semibold text-[#E8536A]">✕</span>
													)
												}
											/>
											<LegacyKV label="Created At" value={formatTimestampWithTz(r.createdAt)} />
											<LegacyKV label="Updated At" value={formatTimestampWithTz(r.updatedAt)} />
										</dl>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		);
	}
	return (
		<Card className="h-full">
			<SectionHeader icon={BadgeCheckIcon} title="Invoice Reports" />
			<CardContent>
				{user.invoiceReports.length === 0 ? (
					<EmptyHint>No invoice reports found for this user.</EmptyHint>
				) : (
					<div className="overflow-hidden rounded-lg border bg-card">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:bg-muted [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
									<TableRow>
										<TableHead className="w-[110px]">Invoice ID</TableHead>
										<TableHead>Order Number</TableHead>
										<TableHead>Period</TableHead>
										<TableHead>Transaction ID</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Timestamps</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_tr]:bg-card [&_td]:align-top">
									{user.invoiceReports.map((r) => (
										<InvoiceReportTableRow key={r.id} report={r} />
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function LegacyKV({
	label,
	value,
	span = 1,
}: {
	label: string;
	value: React.ReactNode;
	span?: 1 | 2;
}) {
	return (
		<div className={cn('flex flex-wrap items-baseline gap-x-2', span === 2 && 'sm:col-span-2')}>
			<dt className="font-medium text-muted-foreground">{label}:</dt>
			<dd className="text-foreground">{value}</dd>
		</div>
	);
}

function InvoiceReportTableRow({ report }: { report: InvoiceReport }) {
	return (
		<TableRow>
			<TableCell className="text-sm font-semibold text-[#224089]">{report.id}</TableCell>
			<TableCell className="text-sm font-mono text-foreground">{report.orderNumber}</TableCell>
			<TableCell>
				<div className="flex flex-col gap-0.5 text-sm whitespace-nowrap">
					<span className="font-semibold text-[#224089]">{report.subscriptionPeriodId}</span>
					<span className="text-xs text-muted-foreground">
						{formatTimestamp(report.subscriptionPeriodStart)} – {formatTimestamp(report.subscriptionPeriodEnd)}
					</span>
				</div>
			</TableCell>
			<TableCell className="break-all font-mono text-sm text-foreground">
				{report.transactionId}
			</TableCell>
			<TableCell>
				<div className="flex flex-col gap-1">
					<Badge
						variant="outline"
						className={cn(
							'gap-1.5 w-fit',
							report.isConfirmed
								? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
								: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
						)}
					>
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: report.isConfirmed ? '#00B86E' : '#E8536A' }}
						/>
						{report.isConfirmed ? 'Confirmed' : 'Unconfirmed'}
					</Badge>
					<Badge
						variant="outline"
						className={cn(
							'gap-1.5 w-fit',
							report.isSent
								? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
								: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
						)}
					>
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: report.isSent ? '#00B86E' : '#E8536A' }}
						/>
						{report.isSent ? 'Sent' : 'Unsent'}
					</Badge>
				</div>
			</TableCell>
			<TableCell>
				<div className="flex flex-col gap-0.5 text-xs whitespace-nowrap">
					<span>
						<span className="text-muted-foreground">Created:</span>{' '}
						<span className="text-foreground">{formatTimestampWithTz(report.createdAt)}</span>
					</span>
					<span>
						<span className="text-muted-foreground">Updated:</span>{' '}
						<span className="text-foreground">{formatTimestampWithTz(report.updatedAt)}</span>
					</span>
				</div>
			</TableCell>
		</TableRow>
	);
}

// ───────────────────────────── helpers ─────────────────────────────

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

function formatTimestamp(s: string) {
	return s.replace('T', ' ').replace(/\+\d{2}:\d{2}$/, '');
}

function formatTimestampWithTz(s: string) {
	return s.replace('T', ' ');
}
