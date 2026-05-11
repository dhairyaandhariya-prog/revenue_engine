'use client';

import {
	BuildingIcon,
	CheckIcon,
	EyeIcon,
	EyeOffIcon,
	KeyRoundIcon,
	PencilIcon,
	XIcon,
} from 'lucide-react';
import { notFound, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { StatusLabel } from '@/components/status-switch';
import {
	TenantFormSections,
	type TenantFormValue,
} from '@/components/tenant-form-sections';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Params = Promise<{ id: string }>;

type TenantDetail = TenantFormValue & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

const TENANTS: Record<string, TenantDetail> = {
	coolmath4kids: {
		id: 'coolmath4kids',
		name: 'Coolmath4Kids',
		key: 'coolmath4Kids',
		isActive: true,
		createdAt: '2026-04-06T16:55:00',
		updatedAt: '2026-04-17T14:14:00',
		heraldRealm: 'coolmathgames',
		heraldClientId: 'coolmathgames-app',
		heraldClientSecret: '4M9R2Ir9L7P9Ee2dXij48uDU55FcG3pIKQQUpXW5UKEHPGC9',
	},
	playkids: {
		id: 'playkids',
		name: 'PlayKids',
		key: 'playkids',
		isActive: true,
		createdAt: '2025-09-12T10:21:00',
		updatedAt: '2026-04-22T09:03:00',
		heraldRealm: 'playkids',
		heraldClientId: 'playkids-app',
		heraldClientSecret: 'Hk7tqBzN3wQpVx4Yc8RfMs2JaLuPdEgGZ9bWj6yT1XnKvCoIeS',
	},
};

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

export default function TenantDetailPage({ params }: { params: Params }) {
	const { id } = React.use(params);
	const initial = TENANTS[id];
	if (!initial) notFound();
	const searchParams = useSearchParams();
	const editParam = searchParams.get('edit') === '1';

	const [tenant, setTenant] = React.useState<TenantDetail>(initial);
	const [editing, setEditing] = React.useState(editParam);
	const [snapshot, setSnapshot] = React.useState<TenantDetail | null>(editParam ? initial : null);
	const [secretVisible, setSecretVisible] = React.useState(false);

	function startEdit() {
		setSnapshot(tenant);
		setEditing(true);
	}
	function saveEdit() {
		setTenant((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
		setSnapshot(null);
		setEditing(false);
	}
	function cancelEdit() {
		if (snapshot) setTenant(snapshot);
		setSnapshot(null);
		setEditing(false);
	}

	const formValue: TenantFormValue = tenant;
	const setFormValue: React.Dispatch<React.SetStateAction<TenantFormValue>> = (updater) => {
		setTenant((prev) => {
			const next = typeof updater === 'function' ? (updater as (p: TenantFormValue) => TenantFormValue)(prev) : updater;
			return { ...prev, ...next };
		});
	};

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'Tenant Management' },
					{ label: 'Tenants', href: '/tenants' },
					{ label: tenant.name },
				]}
			/>
			<main className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-semibold tracking-tight">{tenant.name}</h1>
							<Badge
								variant="outline"
								className={cn(
									'gap-1.5',
									tenant.isActive
										? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
										: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]',
								)}
							>
								<span
									className="size-1.5 rounded-full"
									style={{ backgroundColor: tenant.isActive ? '#00B86E' : '#E8536A' }}
								/>
								{tenant.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							Last Modified: <span className="text-foreground">{formatTimestamp(tenant.updatedAt)}</span>
							<span className="mx-2 text-muted-foreground/40">·</span>
							Created: <span className="text-foreground">{formatTimestamp(tenant.createdAt)}</span>
						</p>
					</div>
					{editing ? (
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" className="h-9" onClick={cancelEdit}>
								<XIcon />
								Cancel
							</Button>
							<Button size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]" onClick={saveEdit}>
								<CheckIcon />
								Save
							</Button>
						</div>
					) : (
						<Button size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]" onClick={startEdit}>
							<PencilIcon />
							Edit
						</Button>
					)}
				</div>

				{editing ? (
					<TenantFormSections value={formValue} onChange={setFormValue} />
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<DetailsReadCard tenant={tenant} />
						<HeraldReadCard
							tenant={tenant}
							secretVisible={secretVisible}
							setSecretVisible={setSecretVisible}
						/>
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

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			<span className="text-sm font-medium text-foreground">{children}</span>
		</div>
	);
}

function DetailsReadCard({ tenant }: { tenant: TenantDetail }) {
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={BuildingIcon} />
				<CardTitle>Details</CardTitle>
			</CardHeader>
			<div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Name">{tenant.name}</ReadField>
				<ReadField label="Key">
					<span className="font-mono">{tenant.key}</span>
				</ReadField>
				<ReadField label="Status">
					<StatusLabel active={tenant.isActive} />
				</ReadField>
			</CardContent>
		</Card>
	);
}

function HeraldReadCard({
	tenant,
	secretVisible,
	setSecretVisible,
}: {
	tenant: TenantDetail;
	secretVisible: boolean;
	setSecretVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const SecretIcon = secretVisible ? EyeIcon : EyeOffIcon;
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center gap-2">
				<CardIcon icon={KeyRoundIcon} />
				<CardTitle>Herald Identity</CardTitle>
			</CardHeader>
			<div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />
			<CardContent className="flex flex-col gap-5">
				<ReadField label="Herald Realm">
					<span className="font-mono">{tenant.heraldRealm}</span>
				</ReadField>
				<ReadField label="Herald Client ID">
					<span className="font-mono">{tenant.heraldClientId}</span>
				</ReadField>
				<div className="flex flex-col gap-1.5">
					<span className="text-xs font-medium text-muted-foreground">Herald Client Secret</span>
					<div className="flex items-center gap-2">
						<span className="break-all font-mono text-sm font-medium text-foreground">
							{secretVisible
								? tenant.heraldClientSecret
								: '•'.repeat(Math.min(tenant.heraldClientSecret.length, 32))}
						</span>
						<button
							type="button"
							aria-label={secretVisible ? 'Hide secret' : 'Show secret'}
							aria-pressed={secretVisible}
							onClick={() => setSecretVisible((v) => !v)}
							className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<SecretIcon className="size-4" />
						</button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
