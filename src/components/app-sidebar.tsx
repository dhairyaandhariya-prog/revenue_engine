'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { createPortal } from 'react-dom';
import {
	Boxes,
	Building2,
	ChevronDown,
	ChevronsUpDown,
	CreditCard,
	FileText,
	KeyRound,
	LayoutGrid,
	Search,
	Shield,
	Tag,
	Users,
	Wrench,
} from 'lucide-react';
import { Collapsible } from 'radix-ui';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar';

type SubItem = {
	title: string;
	href?: string;
	badge?: { value: string; tone: 'destructive' | 'warning' };
};

type NavGroup = {
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	items: SubItem[];
	defaultOpen?: boolean;
};

const navGroups: NavGroup[] = [
	{
		label: 'User Management',
		icon: Users,
		items: [
			{ title: 'Users', href: '/users' },
			{ title: 'User Profiles' },
			{ title: 'User Profiles Limits' },
			{ title: 'JWT Sessions' },
			{ title: 'Device Code Sessions' },
		],
	},
	{
		label: 'User Credentials',
		icon: Search,
		items: [
			{ title: 'User Credentials' },
			{ title: 'Email Password Credentials' },
			{ title: 'KiwiLegacy Credentials' },
			{ title: 'AppleLogin Credentials' },
			{ title: 'PhoneNumber Credentials' },
		],
	},
	{
		label: 'Subscriptions',
		icon: CreditCard,
		items: [
			{ title: 'Subscriptions' },
			{ title: 'AppStore' },
			{ title: 'Digible' },
			{ title: 'Daileon' },
			{ title: 'LegacyGiftcard' },
			{ title: 'GooglePlay' },
			{ title: 'LegacyInternal' },
			{ title: 'Playhub' },
			{ title: 'Sky' },
			{ title: 'Stripe' },
			{ title: 'Vindi' },
			{ title: 'Vizio' },
			{ title: 'LG' },
			{ title: 'Samsung TV' },
			{ title: 'Wister' },
			{ title: 'Lifecycle Free' },
			{ title: 'Market One' },
			{ title: 'Minu' },
			{ title: 'Roku' },
			{ title: 'Viu' },
			{ title: 'Samsung Galaxy Store' },
			{ title: 'Subscription Periods' },
		],
	},
	{
		label: 'Coupon Campaigns',
		icon: Tag,
		items: [
			{ title: 'Internal' },
			{ title: 'Stripe' },
			{ title: 'Minu' },
			{ title: 'Coupon Codes' },
		],
	},
	{
		label: 'SKU Catalog',
		icon: Boxes,
		items: [
			{ title: 'All SKUs', href: '/skus' },
			{ title: 'Plans' },
			{ title: 'Trial Configurations' },
			{ title: 'Pricing History' },
			{ title: 'Coupon Eligibility' },
		],
	},
	{
		label: 'Reports',
		icon: FileText,
		items: [
			{ title: 'Invoice Reports' },
			{ title: 'Invoice Errors', badge: { value: '3', tone: 'destructive' } },
			{ title: 'Unsent Invoices', badge: { value: '7', tone: 'warning' } },
			{ title: 'Invoice Identity Export' },
			{ title: 'Daileon Subscription Plans' },
			{ title: 'Vizio Subscription Plans' },
		],
	},
	{
		label: 'Tools',
		icon: Wrench,
		items: [
			{ title: 'Profile Characters' },
			{ title: 'Characters with Age' },
			{ title: 'Regions' },
			{ title: 'Email Templates' },
			{ title: 'Settings' },
			{ title: 'System Status' },
		],
	},
	{
		label: 'Admin Management',
		icon: Shield,
		items: [
			{ title: 'Admins' },
			{ title: 'Access Restrictions' },
			{ title: 'History Records' },
			{ title: 'Alembic Migrations' },
		],
	},
	{
		label: 'Tenant Management',
		icon: Building2,
		items: [
			{ title: 'Tenant', href: '/tenants' },
			{ title: 'Tenant Admin' },
		],
	},
];

function NexusLogo() {
	return (
		<svg
			viewBox="0 0 200 200"
			fill="none"
			role="img"
			aria-label="Nexus"
			className="size-8 shrink-0"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M100 95L45 47" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M100 95L155 47" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M100 95L32 111" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M100 95L168 111" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M100 95L68 155" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M100 95L132 155" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M45 47H155" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M32 111L68 155" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M168 111L132 155" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M45 47L32 111" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M155 47L168 111" stroke="#FFC101" strokeWidth="1.5" />
			<path d="M45 54C48.866 54 52 50.866 52 47C52 43.134 48.866 40 45 40C41.134 40 38 43.134 38 47C38 50.866 41.134 54 45 54Z" fill="#FFC101" />
			<path d="M155 54C158.866 54 162 50.866 162 47C162 43.134 158.866 40 155 40C151.134 40 148 43.134 148 47C148 50.866 151.134 54 155 54Z" fill="#FFC101" />
			<path d="M32 118C35.866 118 39 114.866 39 111C39 107.134 35.866 104 32 104C28.134 104 25 107.134 25 111C25 114.866 28.134 118 32 118Z" fill="#FFC101" />
			<path d="M168 118C171.866 118 175 114.866 175 111C175 107.134 171.866 104 168 104C164.134 104 161 107.134 161 111C161 114.866 164.134 118 168 118Z" fill="#FFC101" />
			<path d="M68 162C71.866 162 75 158.866 75 155C75 151.134 71.866 148 68 148C64.134 148 61 151.134 61 155C61 158.866 64.134 162 68 162Z" fill="#FFC101" />
			<path d="M132 162C135.866 162 139 158.866 139 155C139 151.134 135.866 148 132 148C128.134 148 125 151.134 125 155C125 158.866 124.134 162 132 162Z" fill="#FFC101" />
			<path d="M100 109C107.732 109 114 102.732 114 95C114 87.268 107.732 81 100 81C92.268 81 86 87.268 86 95C86 102.732 92.268 109 100 109Z" fill="#EF9900" stroke="#FFC101" strokeWidth="2" />
			<path d="M100 100C102.761 100 105 97.7614 105 95C105 92.2386 102.761 90 100 90C97.2386 90 95 92.2386 95 95C95 97.7614 97.2386 100 100 100Z" fill="#FCEA6B" />
		</svg>
	);
}

type Tenant = {
	id: string;
	name: string;
	color: string;
};

const tenants: Tenant[] = [
	{ id: 'playkids', name: 'Playkids', color: '#A400BC' },
	{ id: 'coolmath4kids', name: 'Coolmath4kids', color: '#00B86E' },
];

function TenantMark({ tenant, className }: { tenant: Tenant; className?: string }) {
	const initial = tenant.name[0];
	return (
		<span
			className={
				'flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ' +
				(className ?? '')
			}
			style={{ backgroundColor: tenant.color, color: '#FFFFFF' }}
		>
			{initial}
		</span>
	);
}

function FooterTenantSwitcher() {
	const { state, isMobile } = useSidebar();
	const collapsed = state === 'collapsed' && !isMobile;
	const [activeId, setActiveId] = React.useState<string>('playkids');
	const [switchingTo, setSwitchingTo] = React.useState<Tenant | null>(null);
	const switchTimerRef = React.useRef<number | null>(null);
	const active = tenants.find((t) => t.id === activeId) ?? tenants[0];

	React.useEffect(() => {
		return () => {
			if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
		};
	}, []);

	function changeTenant(nextId: string) {
		if (nextId === activeId) return;
		const target = tenants.find((t) => t.id === nextId);
		if (!target) return;
		setSwitchingTo(target);
		if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
		switchTimerRef.current = window.setTimeout(() => {
			setActiveId(nextId);
			setSwitchingTo(null);
			switchTimerRef.current = null;
		}, 1500);
	}

	const button = (
		<SidebarMenuButton
			size="lg"
			className="gap-3 hover:bg-white/8 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white"
		>
			<TenantMark tenant={active} />
			<span className="min-w-0 flex-1 truncate text-sm font-medium text-white group-data-[collapsible=icon]:hidden">
				{active.name}
			</span>
			<ChevronsUpDown className="size-4 text-white/55 group-data-[collapsible=icon]:hidden" />
		</SidebarMenuButton>
	);

	return (
		<DropdownMenu>
			{collapsed ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="right" align="center">
						{active.name}
					</TooltipContent>
				</Tooltip>
			) : (
				<DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
			)}
			<DropdownMenuContent
				align="end"
				side="top"
				sideOffset={8}
				className="min-w-[--radix-dropdown-menu-trigger-width] w-56"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel>Switch tenant</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={activeId} onValueChange={changeTenant}>
						{tenants.map((tenant) => (
							<DropdownMenuRadioItem
								key={tenant.id}
								value={tenant.id}
								className="gap-2.5 py-2 [&_svg]:!text-current"
							>
								<TenantMark tenant={tenant} className="size-6 rounded-[6px] text-[10px]" />
								<span className="min-w-0 flex-1 truncate text-sm font-medium">{tenant.name}</span>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
			{switchingTo ? <TenantSwitchingOverlay tenant={switchingTo} /> : null}
		</DropdownMenu>
	);
}

function TenantSwitchingOverlay({ tenant }: { tenant: Tenant }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;
	return createPortal(
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-foreground backdrop-blur-sm"
		>
			<Empty className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-2xl">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Spinner className="size-6" />
					</EmptyMedia>
					<EmptyTitle className="text-foreground">Switching to {tenant.name}</EmptyTitle>
					<EmptyDescription>
						Loading the {tenant.name} workspace. Please wait while we update everything.
						Do not refresh the page.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>,
		document.body,
	);
}

export function AppSidebar() {
	const pathname = usePathname();
	const dashboardActive = pathname === '/';
	return (
		<Sidebar collapsible="icon" className="border-r-0">
			<SidebarHeader className="gap-3 p-3">
				<div className="flex min-w-0 items-center gap-2">
					<NexusLogo />
					<span className="text-base font-semibold tracking-tight text-white group-data-[collapsible=icon]:hidden">
						Nexus
					</span>
				</div>
				<div className="relative group-data-[collapsible=icon]:hidden">
					<Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-white/50" />
					<SidebarInput
						placeholder="Search..."
						className="border-white/10 bg-white/5 pl-7 text-white placeholder:text-white/45 focus-visible:bg-white/10"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={dashboardActive}
									tooltip="Dashboard"
									className="text-white/85 hover:bg-white/8 hover:text-white data-active:bg-[#4664E1] data-active:text-white"
								>
									<Link href="/">
										<LayoutGrid />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupContent>
							<SidebarMenu>
								<Collapsible.Root defaultOpen={group.defaultOpen} className="group/collapsible">
									<SidebarMenuItem>
										<Collapsible.Trigger asChild>
											<SidebarMenuButton
												tooltip={group.label}
												className="justify-between text-white/85 hover:bg-white/8 hover:text-white"
											>
												<span className="flex items-center gap-2">
													{group.icon ? <group.icon /> : null}
													<span>{group.label}</span>
												</span>
												<ChevronDown className="size-4 shrink-0 text-white/55 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[collapsible=icon]:hidden" />
											</SidebarMenuButton>
										</Collapsible.Trigger>
										<Collapsible.Content className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
											<SidebarMenuSub className="border-sidebar-border/40">
												{group.items.map((item) => {
													const itemActive = item.href ? pathname === item.href : false;
													const inner = (
														<>
															<span className="truncate">{item.title}</span>
															{item.badge ? (
																<span
																	className={
																		'ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ' +
																		(item.badge.tone === 'destructive'
																			? 'bg-[#E8536A]/20 text-[#FB7185]'
																			: 'bg-[#FFC101]/20 text-[#FFC101]')
																	}
																>
																	{item.badge.value}
																</span>
															) : null}
														</>
													);
													return (
														<SidebarMenuSubItem key={item.title}>
															<SidebarMenuSubButton
																asChild={Boolean(item.href)}
																isActive={itemActive}
																className="text-white/70 hover:bg-white/5 hover:text-white data-active:bg-[#4664E1] data-active:text-white"
															>
																{item.href ? <Link href={item.href}>{inner}</Link> : inner}
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													);
												})}
											</SidebarMenuSub>
										</Collapsible.Content>
									</SidebarMenuItem>
								</Collapsible.Root>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className="border-t border-white/10 p-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<FooterTenantSwitcher />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
