import { AppSidebar } from '@/components/app-sidebar';
import { TenantProvider } from '@/components/tenant-context';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<TenantProvider>
			<SidebarProvider className="h-svh">
				<AppSidebar />
				<SidebarInset className="h-svh overflow-hidden">{children}</SidebarInset>
			</SidebarProvider>
		</TenantProvider>
	);
}
