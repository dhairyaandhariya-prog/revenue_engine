'use client';

import { ChevronRight, LogOut, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

type Crumb = { label: string; href?: string };

export function PageHeader({ crumbs }: { crumbs: Crumb[] }) {
	return (
		<header className="flex h-14 items-center justify-between border-b px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="text-muted-foreground hover:text-foreground" />
				<div className="mx-1 h-4 w-px bg-border" />
				<nav className="flex items-center gap-2 text-sm">
					{crumbs.map((c, i) => {
						const last = i === crumbs.length - 1;
						const labelEl =
							c.href && !last ? (
								<Link href={c.href} className="text-muted-foreground hover:text-foreground hover:underline">
									{c.label}
								</Link>
							) : (
								<span className={last ? 'font-medium text-foreground' : 'text-muted-foreground'}>
									{c.label}
								</span>
							);
						return (
							<React.Fragment key={i}>
								{labelEl}
								{!last ? <ChevronRight className="size-3.5 text-muted-foreground/60" /> : null}
							</React.Fragment>
						);
					})}
				</nav>
			</div>
			<UserProfileMenu />
		</header>
	);
}

function UserProfileMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="User menu"
					className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:ring-2 data-[state=open]:ring-ring"
				>
					<Avatar className="size-8">
						<AvatarFallback className="bg-[#00B86E] text-xs font-semibold text-white">AV</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={8} className="w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="text-sm font-medium">Aditya Vyas</span>
					<span className="text-xs font-normal text-muted-foreground">aditya.vyas@aipxperts.com</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<SettingsIcon />
					Settings
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
