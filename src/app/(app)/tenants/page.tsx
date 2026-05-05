'use client';

import * as React from 'react';
import {
	CheckCircle2Icon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	CircleSlashIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	SlidersHorizontalIcon,
	Trash2Icon,
	XIcon,
} from 'lucide-react';
import { AdvancedFilter, type FilterRow } from '@/components/advanced-filter';
import { PageHeader } from '@/components/page-header';
import { SortableHead, type SortDir } from '@/components/sortable-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Status = 'Active' | 'Inactive';

type TenantRow = {
	id: string;
	name: string;
	key: string;
	status: Status;
};

const PAGE_SIZE = 12;

const baseTenants: TenantRow[] = [
	{ id: 'coolmath4kids', name: 'Coolmath4Kids', key: 'coolmath4Kids', status: 'Active' },
	{ id: 'playkids', name: 'PlayKids', key: 'playkids', status: 'Active' },
];

const FILTER_FIELDS = [
	{ value: 'name', label: 'Name' },
	{ value: 'key', label: 'Key' },
	{ value: 'status', label: 'Status' },
];

const FILTER_OPERATORS = [
	{ value: 'equals', label: 'equals' },
	{ value: 'is_not_equal_to', label: 'is not equal to' },
	{ value: 'is_in', label: 'is in' },
	{ value: 'is_not_in', label: 'is not in' },
	{ value: 'is_like', label: 'is like' },
	{ value: 'is_not_like', label: 'is not like' },
	{ value: 'contains', label: 'contains' },
];

function StatusBadge({ status }: { status: Status }) {
	const active = status === 'Active';
	return (
		<Badge
			variant="outline"
			className={
				active
					? 'border-[#00B86E]/30 bg-[#00B86E]/10 text-[#00B86E]'
					: 'border-[#E8536A]/30 bg-[#E8536A]/10 text-[#E8536A]'
			}
		>
			<span className="size-1.5 rounded-full" style={{ backgroundColor: active ? '#00B86E' : '#E8536A' }} />
			{status}
		</Badge>
	);
}

function fuzzyMatch(needle: string, haystack: string) {
	if (!needle) return true;
	const n = needle.toLowerCase();
	const h = haystack.toLowerCase();
	let i = 0;
	for (const ch of h) {
		if (ch === n[i]) i++;
		if (i === n.length) return true;
	}
	return false;
}

function rowMatches(t: TenantRow, q: string) {
	if (!q) return true;
	return [t.name, t.key, t.status].some((s) => fuzzyMatch(q, s));
}

function fieldValue(t: TenantRow, field: string): string | null {
	switch (field) {
		case 'name':
			return t.name;
		case 'key':
			return t.key;
		case 'status':
			return t.status;
		default:
			return null;
	}
}

function evaluateRow(t: TenantRow, row: FilterRow): boolean {
	const fv = fieldValue(t, row.field);
	const target = row.value.trim();
	const haystack = (fv ?? '').toLowerCase();
	const needle = target.toLowerCase();

	switch (row.operator) {
		case 'equals':
			return target === '' ? true : (fv ?? '') === target;
		case 'is_not_equal_to':
			return target === '' ? true : (fv ?? '') !== target;
		case 'is_in':
			return target === '' ? true : target.split(',').map((s) => s.trim()).includes(fv ?? '');
		case 'is_not_in':
			return target === '' ? true : !target.split(',').map((s) => s.trim()).includes(fv ?? '');
		case 'is_like':
		case 'contains':
			return target === '' ? true : haystack.includes(needle);
		case 'is_not_like':
			return target === '' ? true : !haystack.includes(needle);
		default:
			return true;
	}
}

function passesFilters(t: TenantRow, rows: FilterRow[]): boolean {
	if (rows.length === 0) return true;
	let result = evaluateRow(t, rows[0]);
	for (let i = 1; i < rows.length; i++) {
		const m = evaluateRow(t, rows[i]);
		result = rows[i].connector === 'and' ? result && m : result || m;
	}
	return result;
}

type SortKey = 'name' | 'key' | 'status';

export default function TenantsPage() {
	const [selected, setSelected] = React.useState<Set<string>>(new Set());
	const [page, setPage] = React.useState(1);
	const [search, setSearch] = React.useState('');
	const [sortKey, setSortKey] = React.useState<SortKey>('name');
	const [sortDir, setSortDir] = React.useState<SortDir>('asc');
	const [filters, setFilters] = React.useState<FilterRow[]>([]);
	const [filterOpen, setFilterOpen] = React.useState(false);

	function setSort(key: SortKey, dir: SortDir) {
		setSortKey(key);
		setSortDir(dir);
	}

	const tenants = React.useMemo(() => {
		const rows = baseTenants.filter((t) => rowMatches(t, search) && passesFilters(t, filters));
		if (sortDir === null) return rows;
		const dir = sortDir === 'asc' ? 1 : -1;
		return [...rows].sort((a, b) => {
			const av = String(a[sortKey] ?? '');
			const bv = String(b[sortKey] ?? '');
			return av.localeCompare(bv, undefined, { numeric: true }) * dir;
		});
	}, [search, sortKey, sortDir, filters]);

	const totalRecords = baseTenants.length;
	const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
	const startIdx = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const endIdx = Math.min(page * PAGE_SIZE, totalRecords);

	const allSelected = tenants.length > 0 && selected.size === tenants.length;
	const someSelected = selected.size > 0 && !allSelected;

	function toggleAll(checked: boolean) {
		setSelected(checked ? new Set(tenants.map((t) => t.id)) : new Set());
	}

	function toggleRow(id: string, checked: boolean) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	const hasSelection = selected.size > 0;
	const filterCount = filters.length;

	const dirFor = (key: SortKey): SortDir => (sortKey === key ? sortDir : null);
	const headSetter = (key: SortKey) => (dir: SortDir) => setSort(key, dir);

	return (
		<>
			<PageHeader crumbs={[{ label: 'Nexus' }, { label: 'Tenant Management' }, { label: 'Tenants' }]} />
			<div className="flex min-h-0 flex-1 flex-col gap-4 px-6 py-6">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<h1 className="text-xl font-semibold tracking-tight">Tenants</h1>
						<Badge variant="secondary" className="rounded-full px-2 font-medium tabular-nums">
							{totalRecords.toLocaleString()}
						</Badge>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="relative w-full max-w-sm">
							<SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search by Name..."
								className="h-9 pl-8 pr-9"
							/>
							{search ? (
								<button
									type="button"
									aria-label="Clear search"
									onClick={() => setSearch('')}
									className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
								>
									<XIcon className="size-3.5" />
								</button>
							) : null}
						</div>
						<div className="flex items-center gap-2">
							{hasSelection ? (
								<>
									<span className="mr-1 text-xs text-muted-foreground">{selected.size} selected</span>
									<Button variant="outline" size="sm" className="h-9">
										<CheckCircle2Icon />
										Active
									</Button>
									<Button variant="outline" size="sm" className="h-9">
										<CircleSlashIcon />
										Inactive
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="h-9 border-[#E8536A]/30 bg-[#E8536A]/5 text-[#E8536A] hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
									>
										<Trash2Icon />
										Delete
									</Button>
									<div className="mx-1 h-6 w-px bg-border" />
								</>
							) : null}
							<Popover open={filterOpen} onOpenChange={setFilterOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" size="sm" className="h-9">
										<SlidersHorizontalIcon />
										Filter
										{filterCount > 0 ? (
											<Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 tabular-nums">
												{filterCount}
											</Badge>
										) : null}
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-[720px] max-w-[90vw] p-4">
									<AdvancedFilter
										fields={FILTER_FIELDS}
										operators={FILTER_OPERATORS}
										initialValue={filters}
										onApply={(rows) => {
											setFilters(rows);
											setFilterOpen(false);
										}}
										onClear={() => {
											setFilters([]);
											setFilterOpen(false);
										}}
									/>
								</PopoverContent>
							</Popover>
							<Button asChild size="sm" className="h-9 bg-[#224089] text-white hover:bg-[#1b3470]">
								<a href="/tenants/new">
									<PlusIcon />
									Create New
								</a>
							</Button>
						</div>
					</div>
				</div>

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
					<div className="min-h-0 flex-1 overflow-auto">
						<Table>
							<TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:bg-background">
								<TableRow>
									<TableHead className="w-[44px]">
										<Checkbox
											aria-label="Select all rows"
											checked={allSelected || (someSelected ? 'indeterminate' : false)}
											onCheckedChange={(v) => toggleAll(v === true)}
										/>
									</TableHead>
									<TableHead>
										<SortableHead label="Name" dir={dirFor('name')} onChange={headSetter('name')} />
									</TableHead>
									<TableHead>
										<SortableHead label="Key" dir={dirFor('key')} onChange={headSetter('key')} />
									</TableHead>
									<TableHead>
										<SortableHead label="Status" dir={dirFor('status')} onChange={headSetter('status')} />
									</TableHead>
									<TableHead className="w-[96px] text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tenants.map((t) => {
									const isSelected = selected.has(t.id);
									return (
										<TableRow key={t.id} data-state={isSelected ? 'selected' : undefined}>
											<TableCell>
												<Checkbox
													aria-label={`Select tenant ${t.name}`}
													checked={isSelected}
													onCheckedChange={(v) => toggleRow(t.id, v === true)}
												/>
											</TableCell>
											<TableCell>
												<a
													href={`/tenants/${t.id}`}
													className="text-sm font-medium text-[#224089] hover:underline"
												>
													{t.name}
												</a>
											</TableCell>
											<TableCell className="text-xs">
												<span className="font-mono text-foreground/80">{t.key}</span>
											</TableCell>
											<TableCell>
												<StatusBadge status={t.status} />
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														asChild
														variant="ghost"
														size="icon-sm"
														aria-label={`Edit tenant ${t.name}`}
														className="size-8 text-muted-foreground hover:bg-[#224089]/10 hover:text-[#224089]"
													>
														<a href={`/tenants/${t.id}?edit=1`}>
															<PencilIcon />
														</a>
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label={`Delete tenant ${t.name}`}
														className="size-8 text-muted-foreground hover:bg-[#E8536A]/10 hover:text-[#E8536A]"
													>
														<Trash2Icon />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
								{tenants.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
											No tenants match your search.
										</TableCell>
									</TableRow>
								) : null}
							</TableBody>
						</Table>
					</div>

					<div className="flex shrink-0 items-center justify-between border-t px-4 py-2.5 text-sm">
						<span className="text-muted-foreground">
							<span className="tabular-nums">{startIdx.toLocaleString()}</span>
							{'–'}
							<span className="tabular-nums">{endIdx.toLocaleString()}</span> of{' '}
							<span className="tabular-nums">{totalRecords.toLocaleString()}</span>
						</span>
						<div className="flex items-center gap-3">
							<span className="text-muted-foreground">
								Page <span className="font-medium text-foreground tabular-nums">{page.toLocaleString()}</span> of{' '}
								<span className="tabular-nums">{totalPages.toLocaleString()}</span>
							</span>
							<div className="flex items-center gap-1">
								<Button
									variant="outline"
									size="icon-sm"
									className="size-8 text-[#224089] disabled:text-muted-foreground/40"
									disabled={page === 1}
									onClick={() => setPage(1)}
									aria-label="First page"
								>
									<ChevronsLeftIcon />
								</Button>
								<Button
									variant="outline"
									size="icon-sm"
									className="size-8 text-[#224089] disabled:text-muted-foreground/40"
									disabled={page === 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									aria-label="Previous page"
								>
									<ChevronLeftIcon />
								</Button>
								<Button
									variant="outline"
									size="icon-sm"
									className="size-8 text-[#224089] disabled:text-muted-foreground/40"
									disabled={page === totalPages}
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									aria-label="Next page"
								>
									<ChevronRightIcon />
								</Button>
								<Button
									variant="outline"
									size="icon-sm"
									className="size-8 text-[#224089] disabled:text-muted-foreground/40"
									disabled={page === totalPages}
									onClick={() => setPage(totalPages)}
									aria-label="Last page"
								>
									<ChevronsRightIcon />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
