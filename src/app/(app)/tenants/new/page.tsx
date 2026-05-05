'use client';

import { CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
	EMPTY_TENANT_FORM,
	TenantFormSections,
	type TenantFormValue,
} from '@/components/tenant-form-sections';
import { Button } from '@/components/ui/button';

export default function NewTenantPage() {
	const router = useRouter();
	const [value, setValue] = React.useState<TenantFormValue>(EMPTY_TENANT_FORM);

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		router.push('/tenants');
	}

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'Tenant Management' },
					{ label: 'Tenants', href: '/tenants' },
					{ label: 'New' },
				]}
			/>
			<form
				onSubmit={onSubmit}
				className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-6"
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-semibold tracking-tight">New Tenant</h1>
						<p className="text-sm text-muted-foreground">
							Configure the basics and Herald identity for this tenant.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							size="sm"
							variant="outline"
							className="h-9"
							onClick={() => router.push('/tenants')}
						>
							<XIcon />
							Cancel
						</Button>
						<Button type="submit" size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]">
							<CheckIcon />
							Create
						</Button>
					</div>
				</div>

				<TenantFormSections value={value} onChange={setValue} />
			</form>
		</>
	);
}
