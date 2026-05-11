'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Single source of truth for the Active/Inactive visual treatment used in
// every form and read view across the app (Users, Tenants, SKUs, anything
// new). The dot + colored label + green/rose hex pair is the design system
// pattern — don't fork it inline at call sites.

const COLOR = {
	active: '#00B86E',
	inactive: '#E8536A',
} as const;

export function StatusLabel({
	active,
	className,
}: {
	active: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn('inline-flex items-center gap-1.5 text-sm font-medium', className)}
		>
			<span
				className="size-1.5 rounded-full"
				style={{ backgroundColor: active ? COLOR.active : COLOR.inactive }}
				aria-hidden
			/>
			<span className={active ? 'text-[#00B86E]' : 'text-[#E8536A]'}>
				{active ? 'Active' : 'Inactive'}
			</span>
		</span>
	);
}

export function StatusSwitch({
	active,
	onChange,
	disabled,
	className,
}: {
	active: boolean;
	onChange: (v: boolean) => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<div className={cn('flex items-center gap-3', className)}>
			<Switch
				checked={active}
				onCheckedChange={onChange}
				disabled={disabled}
				aria-label={active ? 'Active' : 'Inactive'}
			/>
			<StatusLabel active={active} />
		</div>
	);
}
