'use client';

import { BuildingIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from 'lucide-react';
import * as React from 'react';
import { StatusSwitch } from '@/components/status-switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type TenantFormValue = {
	name: string;
	key: string;
	isActive: boolean;
	heraldRealm: string;
	heraldClientId: string;
	heraldClientSecret: string;
};

export const EMPTY_TENANT_FORM: TenantFormValue = {
	name: '',
	key: '',
	isActive: true,
	heraldRealm: '',
	heraldClientId: '',
	heraldClientSecret: '',
};

type Props = {
	value: TenantFormValue;
	onChange: React.Dispatch<React.SetStateAction<TenantFormValue>>;
};

export function TenantFormSections({ value, onChange }: Props) {
	const [secretVisible, setSecretVisible] = React.useState(false);
	const SecretIcon = secretVisible ? EyeIcon : EyeOffIcon;

	function set<K extends keyof TenantFormValue>(key: K, v: TenantFormValue[K]) {
		onChange((p) => ({ ...p, [key]: v }));
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Card className="h-full">
				<CardHeader className="flex flex-row items-center gap-2">
					<CardIcon icon={BuildingIcon} />
					<CardTitle>Details</CardTitle>
				</CardHeader>
				<div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />
				<CardContent className="flex flex-col gap-5">
					<FormRow label="Name" required>
						<Input value={value.name} onChange={(e) => set('name', e.target.value)} />
					</FormRow>
					<FormRow label="Key" required>
						<Input value={value.key} onChange={(e) => set('key', e.target.value)} />
					</FormRow>
					<FormRow label="Status" required>
						<StatusSwitch active={value.isActive} onChange={(v) => set('isActive', v)} />
					</FormRow>
				</CardContent>
			</Card>

			<Card className="h-full">
				<CardHeader className="flex flex-row items-center gap-2">
					<CardIcon icon={KeyRoundIcon} />
					<CardTitle>Herald Identity</CardTitle>
				</CardHeader>
				<div role="separator" aria-orientation="horizontal" className="mx-4 h-px bg-border" />
				<CardContent className="flex flex-col gap-5">
					<FormRow
						label="Herald Realm"
						helper={'The Herald realm name for this tenant (e.g. "playkids")'}
					>
						<Input
							value={value.heraldRealm}
							onChange={(e) => set('heraldRealm', e.target.value)}
						/>
					</FormRow>
					<FormRow label="Herald Client ID">
						<Input
							value={value.heraldClientId}
							onChange={(e) => set('heraldClientId', e.target.value)}
						/>
					</FormRow>
					<FormRow label="Herald Client Secret">
						<div className="relative">
							<Input
								type={secretVisible ? 'text' : 'password'}
								value={value.heraldClientSecret}
								onChange={(e) => set('heraldClientSecret', e.target.value)}
								className="pr-9 font-mono"
							/>
							<button
								type="button"
								aria-label={secretVisible ? 'Hide secret' : 'Show secret'}
								aria-pressed={secretVisible}
								onClick={() => setSecretVisible((v) => !v)}
								className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<SecretIcon className="size-4" />
							</button>
						</div>
					</FormRow>
				</CardContent>
			</Card>
		</div>
	);
}

function CardIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
	return (
		<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#224089]/10 text-[#224089]">
			<Icon className="size-4" />
		</span>
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
