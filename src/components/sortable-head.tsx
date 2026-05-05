'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type SortDir = 'asc' | 'desc' | null;

type Props = {
	label: string;
	dir: SortDir;
	onChange: (dir: SortDir) => void;
	className?: string;
};

export function SortableHead({ label, dir, onChange, className }: Props) {
	function flip(target: 'asc' | 'desc') {
		// Same arrow clicked again -> clear sort. Otherwise apply.
		onChange(dir === target ? null : target);
	}

	return (
		<div className={cn('group/sort flex items-center gap-1.5', className)}>
			<span>{label}</span>
			<span className="flex flex-col leading-none opacity-0 transition-opacity group-hover/sort:opacity-100">
				<button
					type="button"
					aria-label={`Sort ${label} ascending`}
					onClick={() => flip('asc')}
					className={cn(
						'-mb-0.5 flex size-3 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground',
						dir === 'asc' && 'text-[#224089]'
					)}
				>
					<ChevronUpIcon className="size-3" />
				</button>
				<button
					type="button"
					aria-label={`Sort ${label} descending`}
					onClick={() => flip('desc')}
					className={cn(
						'flex size-3 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground',
						dir === 'desc' && 'text-[#224089]'
					)}
				>
					<ChevronDownIcon className="size-3" />
				</button>
			</span>
		</div>
	);
}
