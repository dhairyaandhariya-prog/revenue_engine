'use client';

import { Trash2Icon, TriangleAlertIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

type SkuLite = {
	id: string;
	skuId: string;
	name: string;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** When 1 SKU, single-delete copy. When >1, bulk-delete copy. */
	skus: SkuLite[];
	onConfirm: () => void;
};

export function DeleteSkuDialog({ open, onOpenChange, skus, onConfirm }: Props) {
	const count = skus.length;
	const bulk = count > 1;
	const single = skus[0];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px]">
				<DialogHeader>
					<div className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#E8536A]/10 text-[#E8536A]">
						<TriangleAlertIcon className="size-5" />
					</div>
					<DialogTitle>
						{bulk ? `Delete ${count} SKUs?` : `Delete this SKU?`}
					</DialogTitle>
					<DialogDescription>
						{bulk
							? 'These SKUs will be permanently removed from the catalog. Existing subscribers on these plans will be unaffected, but new purchases are no longer possible. This action cannot be undone.'
							: 'This SKU will be permanently removed from the catalog. Existing subscribers on this plan will be unaffected, but new purchases are no longer possible. This action cannot be undone.'}
					</DialogDescription>
				</DialogHeader>

				{bulk ? (
					<div className="flex max-h-44 flex-col gap-1.5 overflow-auto rounded-lg border bg-[#FAFAFA] p-3">
						{skus.map((s) => (
							<div key={s.id} className="flex items-baseline gap-2 text-sm">
								<span className="truncate font-mono text-xs text-[#224089]">{s.skuId}</span>
								<span className="text-muted-foreground/40">·</span>
								<span className="truncate text-foreground">{s.name}</span>
							</div>
						))}
					</div>
				) : single ? (
					<div className="flex flex-col gap-0.5 rounded-lg border bg-[#FAFAFA] p-3">
						<span className="font-mono text-xs text-[#224089]">{single.skuId}</span>
						<span className="text-sm font-medium text-foreground">{single.name}</span>
					</div>
				) : null}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" size="sm" className="h-9">
							Cancel
						</Button>
					</DialogClose>
					<Button
						size="sm"
						className="h-9 bg-[#E8536A] text-white hover:bg-[#cf3f55]"
						onClick={onConfirm}
					>
						<Trash2Icon />
						{bulk ? `Delete ${count} SKUs` : 'Delete SKU'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
