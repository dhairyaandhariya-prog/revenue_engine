'use client';

import { CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import {
	EMPTY_USER_FORM,
	PartnerDataFormSection,
	UserDetailsFormSection,
	type NewUserFormValue,
} from '@/components/user-form-sections';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const TABS = [
	{ value: 'user-details', label: 'User Details' },
	{ value: 'partner-data', label: 'Partner Data' },
] as const;

const tabTriggerClass = 'data-active:text-[#224089] after:bg-[#224089] dark:data-active:text-[#4664E1]';

export default function NewUserPage() {
	const router = useRouter();
	const [value, setValue] = React.useState<NewUserFormValue>(EMPTY_USER_FORM);
	const [activeTab, setActiveTab] = React.useState<string>('user-details');

	const scrollerRef = React.useRef<HTMLElement | null>(null);
	const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});
	const isClickScrollingRef = React.useRef(false);
	const clickScrollTimerRef = React.useRef<number | null>(null);

	// Scroll-spy: on every scroll, pick whichever section's top is closest to the sticky tabs.
	React.useEffect(() => {
		const root = scrollerRef.current;
		if (!root) return;
		const ids = TABS.map((t) => t.value);
		function update() {
			if (isClickScrollingRef.current) return;
			const rootEl = root!;
			// At the very bottom: the user has reached the last section.
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
	}, []);

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

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		router.push('/users');
	}

	const setSectionRef = (key: string) => (el: HTMLElement | null) => {
		sectionRefs.current[key] = el;
	};

	return (
		<>
			<PageHeader
				crumbs={[
					{ label: 'Nexus' },
					{ label: 'User Management' },
					{ label: 'Users', href: '/users' },
					{ label: 'New' },
				]}
			/>
			<main
				ref={scrollerRef}
				className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-auto"
			>
				<form onSubmit={onSubmit} className="flex flex-col">
					<div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-2">
						<div className="flex flex-col gap-1">
							<h1 className="text-xl font-semibold tracking-tight">New User</h1>
							<p className="text-sm text-muted-foreground">
								Fill the sections below. Use the tabs to jump or scroll through them.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="h-9"
								onClick={() => router.push('/users')}
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

					<div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
						<Tabs value={activeTab} onValueChange={handleTabChange}>
							<TabsList variant="line" className="scrollbar-hidden !h-11 -mx-1 gap-2 overflow-x-auto px-1">
								{TABS.map((t) => (
									<TabsTrigger
										key={t.value}
										value={t.value}
										className={cn('px-3 text-sm', tabTriggerClass)}
									>
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
							className="scroll-mt-20"
							aria-label="User Details"
						>
							<UserDetailsFormSection value={value} onChange={setValue} />
						</section>

						<section
							id="partner-data"
							ref={setSectionRef('partner-data')}
							className="scroll-mt-20"
							aria-label="Partner Data"
						>
							<PartnerDataFormSection value={value} onChange={setValue} />
						</section>
					</div>
				</form>
			</main>
		</>
	);
}
