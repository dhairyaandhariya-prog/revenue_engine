'use client';

import { CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
	EMPTY_SKU_FORM,
	SkuFormSections,
	type SkuFormValue,
} from '@/components/sku-form-sections';
import { Button } from '@/components/ui/button';

export default function NewSkuPage() {
	const router = useRouter();
	const [value, setValue] = React.useState<SkuFormValue>(EMPTY_SKU_FORM);

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		router.push('/skus');
	}

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'SKU Catalog' },
					{ label: 'All SKUs', href: '/skus' },
					{ label: 'New' },
				]}
			/>
			<form
				onSubmit={onSubmit}
				className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-6"
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-col gap-1">
						<h1 className="text-xl font-semibold tracking-tight">Create SKU</h1>
						<p className="text-sm text-muted-foreground">
							Define a new subscription plan, pricing, and trial — no developer needed.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							size="sm"
							variant="outline"
							className="h-9"
							onClick={() => router.push('/skus')}
						>
							<XIcon />
							Cancel
						</Button>
						<Button
							type="submit"
							size="sm"
							className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]"
						>
							<CheckIcon />
							Create
						</Button>
					</div>
				</div>

				<SkuFormSections value={value} onChange={setValue} />
			</form>
		</>
	);
}
