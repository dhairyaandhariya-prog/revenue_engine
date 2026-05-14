// Nexus Design System — primitives
// Builds the Nexus color tokens plus the primitive component set inside the
// current Figma file:
//   Button, Card, Input, Badge, Switch, Checkbox, Avatar, Separator,
//   Tooltip, Spinner, Empty, Select, Tabs (default + line), Table.
//
// Re-running creates new components each time. Variables are reused (values
// updated in place); for idempotent components, delete the old ones first or
// extend the plugin to look them up and update.

figma.showUI(__html__, { width: 320, height: 360 });

figma.ui.onmessage = async (msg) => {
	if (msg.type !== 'generate') return;
	try {
		await Promise.all([
			figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
			figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
			figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' }),
		]);
		await generate();
		figma.notify('Nexus design system generated', { timeout: 3000 });
	} catch (err) {
		console.error(err);
		const message = err && err.message ? err.message : String(err);
		figma.notify('Error: ' + message, { error: true, timeout: 6000 });
	}
};

// ─── Tokens ──────────────────────────────────────────────────────────

const TOKENS = {
	// Brand
	'color/primary': '#224089',
	'color/primary-hover': '#1b3470',
	'color/accent': '#4664E1',
	// Status
	'color/success': '#00B86E',
	'color/danger': '#E8536A',
	'color/warning': '#FFC101',
	// Neutrals
	'color/background': '#FAFAFA',
	'color/card': '#FFFFFF',
	'color/foreground': '#111114',
	'color/muted-foreground': '#5A5A66',
	'color/muted': '#F7F7F9',
	'color/border': '#E6E6EB',
	'color/input': '#D5D5DC',
};

function hexToRgb(hex) {
	const h = hex.replace('#', '');
	return {
		r: parseInt(h.slice(0, 2), 16) / 255,
		g: parseInt(h.slice(2, 4), 16) / 255,
		b: parseInt(h.slice(4, 6), 16) / 255,
	};
}

async function ensureCollection() {
	const cols = await figma.variables.getLocalVariableCollectionsAsync();
	const existing = cols.find((c) => c.name === 'Nexus');
	if (existing) return existing;
	return figma.variables.createVariableCollection('Nexus');
}

async function ensureColorVariable(collection, name, hex) {
	const all = await figma.variables.getLocalVariablesAsync('COLOR');
	let v = all.find((vv) => vv.name === name && vv.variableCollectionId === collection.id);
	if (!v) v = figma.variables.createVariable(name, collection, 'COLOR');
	v.setValueForMode(collection.modes[0].modeId, hexToRgb(hex));
	return v;
}

async function createTokens() {
	const collection = await ensureCollection();
	const tokens = {};
	for (const name of Object.keys(TOKENS)) {
		tokens[name] = await ensureColorVariable(collection, name, TOKENS[name]);
	}
	return tokens;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const WHITE = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };

function bindFill(node, variable) {
	const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
	node.fills = [figma.variables.setBoundVariableForPaint(paint, 'color', variable)];
}

function bindFillWithOpacity(node, variable, opacity) {
	const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
	const bound = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
	node.fills = [Object.assign({}, bound, { opacity })];
}

function bindStroke(node, variable) {
	const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
	node.strokes = [figma.variables.setBoundVariableForPaint(paint, 'color', variable)];
}

function setText(node, str, opts) {
	const o = opts || {};
	node.fontName = { family: 'Inter', style: o.style || 'Medium' };
	node.fontSize = o.size || 14;
	node.characters = str;
}

// ─── Button ──────────────────────────────────────────────────────────

function buildButton(variant, size, tokens) {
	const c = figma.createComponent();
	c.name = `variant=${variant}, size=${size}`;
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'AUTO';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.itemSpacing = 8;

	const sm = size === 'sm';
	c.paddingLeft = sm ? 12 : 16;
	c.paddingRight = sm ? 12 : 16;
	c.paddingTop = sm ? 6 : 8;
	c.paddingBottom = sm ? 6 : 8;
	c.cornerRadius = sm ? 6 : 8;

	if (variant === 'default') {
		bindFill(c, tokens['color/primary']);
	} else if (variant === 'outline') {
		bindFill(c, tokens['color/card']);
		c.strokeWeight = 1;
		bindStroke(c, tokens['color/border']);
	} else {
		c.fills = [];
	}

	const t = figma.createText();
	setText(t, 'Button', { size: sm ? 12 : 14, style: 'Medium' });
	if (variant === 'default') {
		t.fills = [WHITE];
	} else {
		bindFill(t, tokens['color/foreground']);
	}
	c.appendChild(t);
	return c;
}

function buildButtonSet(tokens) {
	const variants = ['default', 'outline', 'ghost'];
	const sizes = ['default', 'sm'];
	const components = [];
	for (const v of variants) {
		for (const s of sizes) {
			components.push(buildButton(v, s, tokens));
		}
	}
	const set = figma.combineAsVariants(components, figma.currentPage);
	set.name = 'Button';
	set.layoutMode = 'VERTICAL';
	set.primaryAxisSizingMode = 'AUTO';
	set.counterAxisSizingMode = 'AUTO';
	set.itemSpacing = 16;
	set.paddingTop = 24;
	set.paddingBottom = 24;
	set.paddingLeft = 24;
	set.paddingRight = 24;
	set.cornerRadius = 12;
	bindFill(set, tokens['color/background']);
	return set;
}

// ─── Card ────────────────────────────────────────────────────────────

function buildCard(tokens) {
	const c = figma.createComponent();
	c.name = 'Card';
	c.layoutMode = 'VERTICAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'FIXED';
	c.itemSpacing = 12;
	c.paddingTop = 16;
	c.paddingBottom = 16;
	c.paddingLeft = 16;
	c.paddingRight = 16;
	c.cornerRadius = 12;
	c.resize(360, c.height);
	c.strokeWeight = 1;
	bindFill(c, tokens['color/card']);
	bindStroke(c, tokens['color/border']);

	const title = figma.createText();
	setText(title, 'Card title', { size: 16, style: 'Semi Bold' });
	bindFill(title, tokens['color/foreground']);
	c.appendChild(title);

	const body = figma.createText();
	setText(body, 'Card body content goes here.', { size: 14, style: 'Regular' });
	bindFill(body, tokens['color/muted-foreground']);
	c.appendChild(body);

	return c;
}

// ─── Input ───────────────────────────────────────────────────────────

function buildInput(tokens) {
	const c = figma.createComponent();
	c.name = 'Input';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'MIN';
	c.counterAxisAlignItems = 'CENTER';
	c.itemSpacing = 8;
	c.paddingLeft = 12;
	c.paddingRight = 12;
	c.paddingTop = 8;
	c.paddingBottom = 8;
	c.cornerRadius = 8;
	c.resize(280, 36);
	c.strokeWeight = 1;
	bindFill(c, tokens['color/card']);
	bindStroke(c, tokens['color/input']);

	const placeholder = figma.createText();
	setText(placeholder, 'Placeholder', { size: 14, style: 'Regular' });
	bindFill(placeholder, tokens['color/muted-foreground']);
	c.appendChild(placeholder);
	return c;
}

// ─── Badge ───────────────────────────────────────────────────────────

function buildBadge(variant, tokens) {
	const c = figma.createComponent();
	c.name = `variant=${variant}`;
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'AUTO';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.paddingLeft = 8;
	c.paddingRight = 8;
	c.paddingTop = 2;
	c.paddingBottom = 2;
	c.cornerRadius = 9999;

	let label = 'Badge';
	const t = figma.createText();

	if (variant === 'default') {
		bindFill(c, tokens['color/primary']);
		t.fills = [WHITE];
	} else if (variant === 'secondary') {
		bindFill(c, tokens['color/muted']);
		setText(t, label, { size: 12, style: 'Medium' });
		bindFill(t, tokens['color/foreground']);
	} else if (variant === 'destructive') {
		bindFillWithOpacity(c, tokens['color/danger'], 0.1);
		setText(t, label, { size: 12, style: 'Medium' });
		bindFill(t, tokens['color/danger']);
	} else if (variant === 'outline') {
		bindFill(c, tokens['color/card']);
		c.strokeWeight = 1;
		bindStroke(c, tokens['color/border']);
		setText(t, label, { size: 12, style: 'Medium' });
		bindFill(t, tokens['color/foreground']);
	}

	if (!t.characters) setText(t, label, { size: 12, style: 'Medium' });
	c.appendChild(t);
	return c;
}

function buildBadgeSet(tokens) {
	const variants = ['default', 'secondary', 'destructive', 'outline'];
	const components = variants.map((v) => buildBadge(v, tokens));
	const set = figma.combineAsVariants(components, figma.currentPage);
	set.name = 'Badge';
	set.layoutMode = 'HORIZONTAL';
	set.primaryAxisSizingMode = 'AUTO';
	set.counterAxisSizingMode = 'AUTO';
	set.itemSpacing = 12;
	set.paddingTop = 24;
	set.paddingBottom = 24;
	set.paddingLeft = 24;
	set.paddingRight = 24;
	set.cornerRadius = 12;
	bindFill(set, tokens['color/background']);
	return set;
}

// ─── Switch ──────────────────────────────────────────────────────────

function buildSwitch(state, tokens) {
	const c = figma.createComponent();
	c.name = `state=${state}`;
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = state === 'on' ? 'MAX' : 'MIN';
	c.counterAxisAlignItems = 'CENTER';
	c.paddingLeft = 2;
	c.paddingRight = 2;
	c.paddingTop = 2;
	c.paddingBottom = 2;
	c.resize(36, 20);
	c.cornerRadius = 9999;

	if (state === 'on') {
		bindFill(c, tokens['color/primary']);
	} else {
		bindFill(c, tokens['color/border']);
	}

	const thumb = figma.createEllipse();
	thumb.resize(16, 16);
	thumb.fills = [WHITE];
	c.appendChild(thumb);
	return c;
}

function buildSwitchSet(tokens) {
	const components = [buildSwitch('off', tokens), buildSwitch('on', tokens)];
	const set = figma.combineAsVariants(components, figma.currentPage);
	set.name = 'Switch';
	set.layoutMode = 'HORIZONTAL';
	set.primaryAxisSizingMode = 'AUTO';
	set.counterAxisSizingMode = 'AUTO';
	set.itemSpacing = 16;
	set.paddingTop = 24;
	set.paddingBottom = 24;
	set.paddingLeft = 24;
	set.paddingRight = 24;
	set.cornerRadius = 12;
	bindFill(set, tokens['color/background']);
	return set;
}

// ─── Checkbox ────────────────────────────────────────────────────────

function buildCheckbox(state, tokens) {
	const c = figma.createComponent();
	c.name = `state=${state}`;
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.resize(16, 16);
	c.cornerRadius = 4;

	if (state === 'unchecked') {
		bindFill(c, tokens['color/card']);
		c.strokeWeight = 1;
		bindStroke(c, tokens['color/input']);
	} else {
		bindFill(c, tokens['color/primary']);
	}

	if (state === 'checked') {
		const svg = figma.createNodeFromSvg(
			`<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M2 5L4 7L8 3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
		);
		svg.name = 'check';
		c.appendChild(svg);
	} else if (state === 'indeterminate') {
		const svg = figma.createNodeFromSvg(
			`<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="5" x2="8" y2="5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`,
		);
		svg.name = 'dash';
		c.appendChild(svg);
	}
	return c;
}

function buildCheckboxSet(tokens) {
	const components = [
		buildCheckbox('unchecked', tokens),
		buildCheckbox('checked', tokens),
		buildCheckbox('indeterminate', tokens),
	];
	const set = figma.combineAsVariants(components, figma.currentPage);
	set.name = 'Checkbox';
	set.layoutMode = 'HORIZONTAL';
	set.primaryAxisSizingMode = 'AUTO';
	set.counterAxisSizingMode = 'AUTO';
	set.itemSpacing = 16;
	set.paddingTop = 24;
	set.paddingBottom = 24;
	set.paddingLeft = 24;
	set.paddingRight = 24;
	set.cornerRadius = 12;
	bindFill(set, tokens['color/background']);
	return set;
}

// ─── Avatar ──────────────────────────────────────────────────────────

function buildAvatar(tokens) {
	const c = figma.createComponent();
	c.name = 'Avatar';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.resize(40, 40);
	c.cornerRadius = 9999;
	bindFill(c, tokens['color/muted']);

	const t = figma.createText();
	setText(t, 'JD', { size: 14, style: 'Medium' });
	bindFill(t, tokens['color/foreground']);
	c.appendChild(t);
	return c;
}

// ─── Separator ───────────────────────────────────────────────────────

function buildSeparator(tokens) {
	const c = figma.createComponent();
	c.name = 'Separator';
	c.resize(240, 1);
	bindFill(c, tokens['color/border']);
	return c;
}

// ─── Tooltip ─────────────────────────────────────────────────────────

function buildTooltip(tokens) {
	const c = figma.createComponent();
	c.name = 'Tooltip';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'AUTO';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.paddingLeft = 8;
	c.paddingRight = 8;
	c.paddingTop = 4;
	c.paddingBottom = 4;
	c.cornerRadius = 6;
	bindFill(c, tokens['color/foreground']);

	const t = figma.createText();
	setText(t, 'Tooltip text', { size: 12, style: 'Medium' });
	t.fills = [WHITE];
	c.appendChild(t);
	return c;
}

// ─── Spinner ─────────────────────────────────────────────────────────

function buildSpinner() {
	const c = figma.createComponent();
	c.name = 'Spinner';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'CENTER';
	c.counterAxisAlignItems = 'CENTER';
	c.resize(20, 20);
	c.fills = [];

	const svg = figma.createNodeFromSvg(
		`<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="#E6E6EB" stroke-width="2" fill="none"/><path d="M10 2 a 8 8 0 0 1 8 8" stroke="#224089" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
	);
	svg.name = 'spinner';
	c.appendChild(svg);
	return c;
}

// ─── Empty ───────────────────────────────────────────────────────────

function buildEmpty(tokens) {
	const c = figma.createComponent();
	c.name = 'Empty';
	c.layoutMode = 'VERTICAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'MIN';
	c.counterAxisAlignItems = 'CENTER';
	c.itemSpacing = 12;
	c.paddingTop = 32;
	c.paddingBottom = 32;
	c.paddingLeft = 24;
	c.paddingRight = 24;
	c.resize(360, c.height);
	c.cornerRadius = 12;
	c.strokeWeight = 1;
	bindFill(c, tokens['color/card']);
	bindStroke(c, tokens['color/border']);

	const iconBox = figma.createFrame();
	iconBox.name = 'icon';
	iconBox.layoutMode = 'HORIZONTAL';
	iconBox.primaryAxisSizingMode = 'FIXED';
	iconBox.counterAxisSizingMode = 'FIXED';
	iconBox.primaryAxisAlignItems = 'CENTER';
	iconBox.counterAxisAlignItems = 'CENTER';
	iconBox.resize(48, 48);
	iconBox.cornerRadius = 9999;
	bindFill(iconBox, tokens['color/muted']);
	c.appendChild(iconBox);

	const title = figma.createText();
	setText(title, 'No data found', { size: 14, style: 'Semi Bold' });
	bindFill(title, tokens['color/foreground']);
	c.appendChild(title);

	const desc = figma.createText();
	setText(desc, 'Try adjusting your filters or come back later.', {
		size: 13,
		style: 'Regular',
	});
	bindFill(desc, tokens['color/muted-foreground']);
	desc.textAlignHorizontal = 'CENTER';
	c.appendChild(desc);
	return c;
}

// ─── Select ──────────────────────────────────────────────────────────

function buildSelect(tokens) {
	const c = figma.createComponent();
	c.name = 'Select';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'FIXED';
	c.counterAxisSizingMode = 'FIXED';
	c.primaryAxisAlignItems = 'SPACE_BETWEEN';
	c.counterAxisAlignItems = 'CENTER';
	c.itemSpacing = 8;
	c.paddingLeft = 12;
	c.paddingRight = 12;
	c.paddingTop = 8;
	c.paddingBottom = 8;
	c.cornerRadius = 8;
	c.resize(280, 36);
	c.strokeWeight = 1;
	bindFill(c, tokens['color/card']);
	bindStroke(c, tokens['color/input']);

	const value = figma.createText();
	setText(value, 'Select option', { size: 14, style: 'Regular' });
	bindFill(value, tokens['color/muted-foreground']);
	c.appendChild(value);

	const chev = figma.createNodeFromSvg(
		`<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5L6 7.5L9 4.5" stroke="#5A5A66" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
	);
	chev.name = 'chevron';
	c.appendChild(chev);
	return c;
}

// ─── Tabs ────────────────────────────────────────────────────────────

function buildTabsDefault(tokens) {
	const c = figma.createComponent();
	c.name = 'Tabs (default)';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'AUTO';
	c.itemSpacing = 0;
	c.paddingTop = 3;
	c.paddingBottom = 3;
	c.paddingLeft = 3;
	c.paddingRight = 3;
	c.cornerRadius = 8;
	bindFill(c, tokens['color/muted']);

	const trigger = (label, active) => {
		const t = figma.createFrame();
		t.name = active ? `${label} (active)` : label;
		t.layoutMode = 'HORIZONTAL';
		t.primaryAxisSizingMode = 'AUTO';
		t.counterAxisSizingMode = 'AUTO';
		t.primaryAxisAlignItems = 'CENTER';
		t.counterAxisAlignItems = 'CENTER';
		t.paddingLeft = 12;
		t.paddingRight = 12;
		t.paddingTop = 4;
		t.paddingBottom = 4;
		t.cornerRadius = 6;
		if (active) {
			bindFill(t, tokens['color/card']);
		} else {
			t.fills = [];
		}
		const txt = figma.createText();
		setText(txt, label, { size: 13, style: 'Medium' });
		bindFill(txt, active ? tokens['color/foreground'] : tokens['color/muted-foreground']);
		t.appendChild(txt);
		return t;
	};

	c.appendChild(trigger('Overview', true));
	c.appendChild(trigger('Activity', false));
	c.appendChild(trigger('Settings', false));
	return c;
}

function buildTabsLine(tokens) {
	const c = figma.createComponent();
	c.name = 'Tabs (line)';
	c.layoutMode = 'HORIZONTAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'AUTO';
	c.itemSpacing = 4;
	c.fills = [];

	const trigger = (label, active) => {
		const t = figma.createFrame();
		t.name = active ? `${label} (active)` : label;
		t.layoutMode = 'VERTICAL';
		t.primaryAxisSizingMode = 'AUTO';
		t.counterAxisSizingMode = 'AUTO';
		t.primaryAxisAlignItems = 'MIN';
		t.counterAxisAlignItems = 'CENTER';
		t.itemSpacing = 6;
		t.paddingLeft = 12;
		t.paddingRight = 12;
		t.paddingTop = 6;
		t.fills = [];

		const txt = figma.createText();
		setText(txt, label, { size: 13, style: 'Medium' });
		bindFill(txt, active ? tokens['color/foreground'] : tokens['color/muted-foreground']);
		t.appendChild(txt);

		const underline = figma.createRectangle();
		underline.name = 'underline';
		underline.resize(48, 2);
		if (active) {
			bindFill(underline, tokens['color/foreground']);
		} else {
			underline.fills = [];
		}
		underline.layoutAlign = 'STRETCH';
		t.appendChild(underline);
		return t;
	};

	c.appendChild(trigger('Overview', true));
	c.appendChild(trigger('Activity', false));
	c.appendChild(trigger('Settings', false));
	return c;
}

// ─── Table ───────────────────────────────────────────────────────────

function buildTable(tokens) {
	const c = figma.createComponent();
	c.name = 'Table';
	c.layoutMode = 'VERTICAL';
	c.primaryAxisSizingMode = 'AUTO';
	c.counterAxisSizingMode = 'FIXED';
	c.itemSpacing = 0;
	c.cornerRadius = 12;
	c.resize(560, c.height);
	c.strokeWeight = 1;
	c.clipsContent = true;
	bindFill(c, tokens['color/card']);
	bindStroke(c, tokens['color/border']);

	const buildRow = (values, header) => {
		const r = figma.createFrame();
		r.name = header ? 'header' : 'row';
		r.layoutMode = 'HORIZONTAL';
		r.primaryAxisSizingMode = 'FIXED';
		r.counterAxisSizingMode = 'AUTO';
		r.counterAxisAlignItems = 'CENTER';
		r.itemSpacing = 0;
		r.paddingTop = header ? 10 : 12;
		r.paddingBottom = header ? 10 : 12;
		r.paddingLeft = 16;
		r.paddingRight = 16;
		r.layoutAlign = 'STRETCH';
		if (header) {
			bindFill(r, tokens['color/muted']);
		} else {
			r.fills = [];
		}

		values.forEach((val) => {
			const cell = figma.createFrame();
			cell.name = 'cell';
			cell.layoutMode = 'HORIZONTAL';
			cell.primaryAxisSizingMode = 'FIXED';
			cell.counterAxisSizingMode = 'AUTO';
			cell.fills = [];
			cell.layoutGrow = 1;
			const txt = figma.createText();
			setText(txt, val, { size: 13, style: header ? 'Medium' : 'Regular' });
			bindFill(txt, header ? tokens['color/muted-foreground'] : tokens['color/foreground']);
			cell.appendChild(txt);
			r.appendChild(cell);
		});
		return r;
	};

	const buildDivider = () => {
		const d = figma.createFrame();
		d.name = 'divider';
		d.resize(1, 1);
		d.layoutAlign = 'STRETCH';
		bindFill(d, tokens['color/border']);
		return d;
	};

	c.appendChild(buildRow(['ID', 'Name', 'Status'], true));
	c.appendChild(buildDivider());
	c.appendChild(buildRow(['932301', 'Aiden Carter', 'Active'], false));
	c.appendChild(buildDivider());
	c.appendChild(buildRow(['932302', 'Sophia Lee', 'Active'], false));
	c.appendChild(buildDivider());
	c.appendChild(buildRow(['932303', 'Marcus Reed', 'Inactive'], false));

	return c;
}

// ─── Generate ────────────────────────────────────────────────────────

function placeRow(items, x, y, gap) {
	const g = gap == null ? 64 : gap;
	let cursor = x;
	let maxH = 0;
	items.forEach((it) => {
		it.x = cursor;
		it.y = y;
		cursor += it.width + g;
		maxH = Math.max(maxH, it.height);
	});
	return maxH;
}

async function generate() {
	const tokens = await createTokens();

	// Primitives
	const buttonSet = buildButtonSet(tokens);
	const card = buildCard(tokens);
	const input = buildInput(tokens);
	const badgeSet = buildBadgeSet(tokens);
	const switchSet = buildSwitchSet(tokens);
	const checkboxSet = buildCheckboxSet(tokens);
	const avatar = buildAvatar(tokens);
	const separator = buildSeparator(tokens);
	const tooltip = buildTooltip(tokens);
	const spinner = buildSpinner();
	const empty = buildEmpty(tokens);
	const select = buildSelect(tokens);
	const tabsDefault = buildTabsDefault(tokens);
	const tabsLine = buildTabsLine(tokens);
	const table = buildTable(tokens);

	const SECTION_GAP = 80;

	let y = 0;
	const h1 = placeRow([buttonSet, card, input], 0, y);
	y += h1 + SECTION_GAP;

	const h2 = placeRow([badgeSet, switchSet, checkboxSet], 0, y);
	y += h2 + SECTION_GAP;

	const h3 = placeRow([avatar, separator, tooltip, spinner], 0, y);
	y += h3 + SECTION_GAP;

	const h4 = placeRow([select, tabsDefault, tabsLine], 0, y);
	y += h4 + SECTION_GAP;

	const h5 = placeRow([empty, table], 0, y);
	y += h5 + SECTION_GAP;

	figma.viewport.scrollAndZoomIntoView([
		buttonSet,
		card,
		input,
		badgeSet,
		switchSet,
		checkboxSet,
		avatar,
		separator,
		tooltip,
		spinner,
		empty,
		select,
		tabsDefault,
		tabsLine,
		table,
	]);
}
