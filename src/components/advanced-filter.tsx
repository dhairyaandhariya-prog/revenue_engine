'use client';

import { PlusIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type FilterField = { value: string; label: string };
export type FilterOperator = { value: string; label: string };

export type FilterRow = {
	id: string;
	connector: 'and' | 'or'; // connector to the previous row; ignored on the first row
	field: string;
	operator: string;
	value: string;
};

type Props = {
	fields: FilterField[];
	operators: FilterOperator[];
	initialValue: FilterRow[];
	onApply: (rows: FilterRow[]) => void;
	onClear?: () => void;
};

let nextId = 1;
function rid() {
	return `f${nextId++}`;
}

export function AdvancedFilter({ fields, operators, initialValue, onApply, onClear }: Props) {
	const [draft, setDraft] = React.useState<FilterRow[]>(initialValue);

	function update(id: string, patch: Partial<FilterRow>) {
		setDraft((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	}

	function remove(id: string) {
		setDraft((prev) => prev.filter((r) => r.id !== id));
	}

	function addAfter(id: string, connector: 'and' | 'or') {
		setDraft((prev) => {
			const idx = prev.findIndex((r) => r.id === id);
			const newRow: FilterRow = {
				id: rid(),
				connector,
				field: fields[0]?.value ?? '',
				operator: operators[0]?.value ?? '',
				value: '',
			};
			const next = [...prev];
			next.splice(idx + 1, 0, newRow);
			return next;
		});
	}

	function addAtEnd(connector: 'and' | 'or') {
		setDraft((prev) => [
			...prev,
			{
				id: rid(),
				connector,
				field: fields[0]?.value ?? '',
				operator: operators[0]?.value ?? '',
				value: '',
			},
		]);
	}

	function clearAll() {
		setDraft([]);
		onClear?.();
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="text-xs font-medium text-muted-foreground">Filter Users where</div>

			{draft.length === 0 ? (
				<Button variant="outline" size="sm" onClick={() => addAtEnd('and')} className="w-fit">
					<PlusIcon />
					Add filter
				</Button>
			) : (
				<div className="flex flex-col gap-2">
					{draft.map((row, idx) => (
						<React.Fragment key={row.id}>
							{idx > 0 ? (
								<div className="text-xs font-medium text-muted-foreground">
									{row.connector === 'and' ? 'And' : 'Or'}
								</div>
							) : null}
							<div className="flex items-center gap-2">
								<Select value={row.field} onValueChange={(v) => update(row.id, { field: v })}>
									<SelectTrigger size="sm" className="h-9 min-w-[180px] flex-1">
										<SelectValue placeholder="Field" />
									</SelectTrigger>
									<SelectContent>
										{fields.map((f) => (
											<SelectItem key={f.value} value={f.value}>
												{f.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select value={row.operator} onValueChange={(v) => update(row.id, { operator: v })}>
									<SelectTrigger size="sm" className="h-9 min-w-[140px] flex-1">
										<SelectValue placeholder="Operator" />
									</SelectTrigger>
									<SelectContent>
										{operators.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Input
									value={row.value}
									onChange={(e) => update(row.id, { value: e.target.value })}
									placeholder="Enter a value"
									className="h-9 min-w-[160px] flex-1"
								/>

								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => remove(row.id)}
									aria-label="Remove filter"
									className="size-8 rounded-full text-muted-foreground hover:bg-muted"
								>
									<XIcon />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => addAfter(row.id, 'and')}
									aria-label="Add AND filter"
									className="size-8 rounded-full text-muted-foreground hover:bg-muted"
								>
									<PlusIcon />
								</Button>
							</div>
						</React.Fragment>
					))}

					<Button
						variant="ghost"
						size="sm"
						onClick={() => addAtEnd('or')}
						className="mt-1 w-fit gap-2 text-xs text-muted-foreground hover:bg-muted"
					>
						<PlusIcon className="size-3.5" />
						Or
					</Button>
				</div>
			)}

			<div className="mt-1 flex items-center justify-end gap-2 border-t pt-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={clearAll}
					disabled={draft.length === 0 && initialValue.length === 0}
				>
					Clear
				</Button>
				<Button
					size="sm"
					onClick={() => onApply(draft)}
					className="bg-[#224089] text-white hover:bg-[#1b3470]"
				>
					Apply filters
				</Button>
			</div>
		</div>
	);
}
