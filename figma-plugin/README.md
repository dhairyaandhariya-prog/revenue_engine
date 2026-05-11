# Nexus Figma Plugin

A custom Figma plugin that scaffolds the Nexus design system inside any Figma file. Covers tokens plus the full primitive component set. Composites and screens come next.

## What it creates

- **Color variables** in a `Nexus` collection, bound to the same hex values as `src/app/globals.css`:
  - Brand: `color/primary` `#224089`, `color/primary-hover` `#1b3470`, `color/accent` `#4664E1`
  - Status: `color/success` `#00B86E`, `color/danger` `#E8536A`, `color/warning` `#FFC101`
  - Neutrals: `color/background` `#FAFAFA`, `color/card` `#FFFFFF`, `color/foreground` `#111114`, `color/muted-foreground` `#5A5A66`, `color/muted` `#F7F7F9`, `color/border` `#E6E6EB`, `color/input` `#D5D5DC`
- **Button** — component set: `variant=default | outline | ghost` × `size=default | sm`
- **Badge** — component set: `variant=default | secondary | destructive | outline`
- **Switch** — component set: `state=off | on`
- **Checkbox** — component set: `state=unchecked | checked | indeterminate`
- **Card** — vertical auto-layout with title + body
- **Input** — fixed-size horizontal layout with placeholder
- **Select** — like Input plus a chevron, value left / icon right via `SPACE_BETWEEN`
- **Avatar** — 40×40 circle with initials
- **Tabs (default)** — pill bar matching the app's `bg-muted` rounded list
- **Tabs (line)** — underline-only variant
- **Table** — header row + 3 body rows + hairline dividers, fixed 560 wide
- **Empty** — card with icon circle, title, description
- **Tooltip** — dark rounded chip with white text
- **Spinner** — 20×20 ring (icon-only; SVG colors match Nexus tokens but are not bound)
- **Separator** — 240×1 hairline

All fills and strokes are bound to the variables (except where noted), so changing a token updates every instance across the file.

## Install (one time)

1. In Figma, top menu → **Plugins → Development → Import plugin from manifest…**
2. Pick `figma-plugin/manifest.json` from this repo.
3. The plugin appears under **Plugins → Development → Nexus Design System**.

> Tip: keep this repo clone next to your Figma file so you can edit `code.js` and reload the plugin without re-importing.

## Run

1. Open the Figma file you want to populate (or create a fresh one).
2. **Plugins → Development → Nexus Design System**.
3. Click **Generate**.

The plugin creates the `Nexus` variable collection and stamps Button / Card / Input onto the current page. The viewport scrolls to them.

## Iterate

- Edit `figma-plugin/code.js` (token list, component definitions).
- In Figma: right-click the plugin tab → **Reload plugin**, or rerun from the menu.
- Click **Generate** again. Variables are reused (values updated in place); components are created fresh each run.

## Scope

Tokens and primitives are in. Next iterations expand to:

1. App composites — PageHeader, AppSidebar, SectionHeader, FormRow, ReadField, TenantMark, AdditionalInfoCard, IdentityDocumentItem, ProfileTableRow
2. Screens — Users list, User detail (view + edit), Create User, Tenants list, Tenant detail (view + edit), Create Tenant
3. Code Connect mappings — link each Figma component back to its `src/components/...` file so designers see the real React snippet in Dev Mode

## File layout

```
figma-plugin/
├── manifest.json   # plugin manifest (name, entry points, permissions)
├── code.js         # main plugin code (runs in Figma's plugin sandbox)
├── ui.html         # UI panel shown when the plugin opens
└── README.md
```
