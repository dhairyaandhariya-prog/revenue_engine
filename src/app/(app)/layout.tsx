import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider className="h-svh">
			<AppSidebar />
			<SidebarInset className="h-svh overflow-hidden">{children}</SidebarInset>
		</SidebarProvider>
	);
}
