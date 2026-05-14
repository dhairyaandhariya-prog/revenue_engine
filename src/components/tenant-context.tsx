'use client';

import * as React from 'react';
import { TENANT_BRANDS, type TenantBrand } from '@/lib/skus';

type TenantCtx = {
	activeId: string;
	setActiveId: (id: string) => void;
	active: TenantBrand;
};

const TenantContext = React.createContext<TenantCtx | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
	const [activeId, setActiveId] = React.useState<string>(TENANT_BRANDS[0].id);
	const active = TENANT_BRANDS.find((t) => t.id === activeId) ?? TENANT_BRANDS[0];
	const value = React.useMemo(
		() => ({ activeId, setActiveId, active }),
		[activeId, active],
	);
	return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantCtx {
	const ctx = React.useContext(TenantContext);
	if (!ctx) throw new Error('useTenant must be used within TenantProvider');
	return ctx;
}
