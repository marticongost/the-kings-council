import { SvelteSet } from 'svelte/reactivity';
import {
	focusTargetOf,
	gridOf,
	neighbourInDirection,
	rectOf,
	selectableSelector,
	selectorOf,
	visibleItems,
	type Direction
} from './gridnav';
import type { SimulatorSelection, SelectionKind } from './selection.svelte';
import type { PlanController } from './plans.svelte';
import type { TurnResolution } from './resolution.svelte';
import type { SimulatorState } from './simulatorstate.svelte';
import {
	cardScope,
	cardsOfGroups,
	cardsOfPlayers,
	concreteTypeKeys,
	counterShortcutApplies,
	counterShortcuts,
	groupIdOfPlayer,
	groupIdsOfPlayers,
	groupsOfCards,
	isConcreteTypeKey,
	isCounterShortcutKey,
	isTypeKey,
	independentKingdomId,
	kingdomGroups,
	kingdomIdsInOrder,
	matchesType,
	nonConcreteTypeKeys,
	orderedCards,
	orderedPlayers,
	playerIdsOfCards,
	playersInGroups,
	resourceOfShortcut,
	statOfShortcut,
	typeLabel,
	type CardEntry,
	type ConcreteTypeKey,
	type CounterShortcutKey,
	type TypeKey
} from './keyboardnav';
import type { PlayerState } from './types';

type PendingCommand =
	| { kind: 'filter' }
	| { kind: 'acquire'; amount: string }
	| { kind: 'adjust'; direction: -1 | 1; amount: string }
	| { kind: 'set'; amount: string }
	| { kind: 'create'; amount: string };

export type SelectionView = 'page' | 'kingdoms' | 'players' | 'cards';

export interface CueItem {
	keys: Array<string>;
	label: string;
}

export interface CueSection {
	title: string;
	items: Array<CueItem>;
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	return target.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

/** Modifier and other non-character keys must not cancel a pending sequence. */
function isModifierKey(key: string): boolean {
	return (
		key === 'Shift' ||
		key === 'Control' ||
		key === 'Alt' ||
		key === 'AltGraph' ||
		key === 'Meta' ||
		key === 'CapsLock' ||
		key === 'Dead'
	);
}

/** Scrolls an element into view and moves the focus to it. */
function revealElement(kind: SelectionKind, id: string): void {
	if (typeof document === 'undefined') return;
	const selector = selectorOf(kind, id);

	requestAnimationFrame(() => {
		document
			.querySelector<HTMLElement>(selector)
			?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		focusTargetOf(kind, id)?.focus({ preventScroll: true });
	});
}

/** Translates key presses into selection changes and simulator actions. */
export class KeyboardController {
	readonly simulator: SimulatorState;
	readonly selection: SimulatorSelection;
	readonly plans: PlanController;
	readonly resolution: TurnResolution;
	pending = $state<PendingCommand | null>(null);

	constructor(
		simulator: SimulatorState,
		selection: SimulatorSelection,
		plans: PlanController,
		resolution: TurnResolution
	) {
		this.simulator = simulator;
		this.selection = selection;
		this.plans = plans;
		this.resolution = resolution;
	}

	get view(): SelectionView {
		if (this.selection.cards.size > 0) return 'cards';
		if (this.selection.players.size > 0) return 'players';
		if (this.selection.kingdoms.size > 0) return 'kingdoms';
		return 'page';
	}

	get hasResourceTargets(): boolean {
		return this.selection.players.size > 0;
	}

	get hasStatTargets(): boolean {
		return [...this.selection.kingdoms].some((id) => id !== independentKingdomId);
	}

	get hasCounterTargets(): boolean {
		return this.hasResourceTargets || this.hasStatTargets;
	}

	/** Whether the plan modal can be opened, which needs a single selected player. */
	get canOpenPlan(): boolean {
		return this.view === 'players' && this.selection.players.size === 1 && !this.resolution.active;
	}

	get cues(): Array<CueSection> {
		const pending = this.pending;
		if (pending?.kind === 'filter') {
			return [
				{
					title: 'Filtra les cartes per tipus',
					items: [...this.typeCues(false), { keys: ['Esc'], label: 'Cancel·la' }]
				}
			];
		}

		if (pending?.kind === 'acquire') {
			const amount = pending.amount || '1';
			return [
				{
					title: `Adquireix ${amount} carta${amount === '1' ? '' : 's'}`,
					items: [
						{ keys: ['0-9'], label: 'Quantitat (opcional)' },
						...this.typeCues(true),
						{ keys: ['Esc'], label: 'Cancel·la' }
					]
				}
			];
		}

		if (pending?.kind === 'adjust') {
			const amount = pending.amount || '1';
			const verb = pending.direction === 1 ? 'Incrementa' : 'Disminueix';
			return [
				{
					title: `${verb} ${amount}`,
					items: [
						{ keys: ['0-9'], label: 'Quantitat (opcional)' },
						...this.counterCues(),
						{ keys: ['Esc'], label: 'Cancel·la' }
					]
				}
			];
		}

		if (pending?.kind === 'set') {
			const amount = pending.amount || '?';
			return [
				{
					title: `Estableix a ${amount}`,
					items: [
						{ keys: ['0-9'], label: 'Quantitat' },
						...this.counterCues(),
						{ keys: ['Esc'], label: 'Cancel·la' }
					]
				}
			];
		}

		if (pending?.kind === 'create') {
			const amount = pending.amount || '1';
			return [
				{
					title: `Afegeix ${amount}`,
					items: [
						{ keys: ['0-9'], label: 'Quantitat (opcional)' },
						{ keys: ['k'], label: 'Regnes' },
						{ keys: ['p'], label: 'Jugadors' },
						{ keys: ['Esc'], label: 'Cancel·la' }
					]
				}
			];
		}

		const sections: Array<CueSection> = [];

		if (this.resolution.active) {
			const current = this.resolution.current;
			const nextLabel =
				current?.kind === 'crisis'
					? 'Pagar contribucions'
					: current?.kind === 'assets-bid'
						? 'Repartir actius'
						: this.resolution.atEnd
							? 'Finalitza el torn'
							: 'Capacitat següent';
			sections.push({
				title: 'Resolució del torn',
				items: [
					{ keys: ['Espai'], label: nextLabel },
					{ keys: ['Shift', 'Espai'], label: 'Pas anterior' },
					{ keys: ['Esc'], label: 'Atura la resolució' }
				]
			});
		}

		switch (this.view) {
			case 'page':
				sections.push({
					title: 'Pàgina',
					items: [
						{ keys: ['k'], label: 'Tots els regnes' },
						{ keys: ['p'], label: 'Tots els jugadors' },
						{ keys: ['c'], label: 'Totes les cartes' }
					]
				});
				break;
			case 'kingdoms':
				sections.push({
					title: 'Regnes seleccionats',
					items: [
						{ keys: ['⌫'], label: 'Selecciona la pàgina' },
						{ keys: ['p'], label: 'Jugadors dels regnes' },
						{ keys: ['c'], label: 'Cartes dels regnes' },
						{ keys: ['←', '↑', '↓', '→'], label: 'Mou-te per la graella' },
						{ keys: ['Home', 'End'], label: 'Primer / últim regne' }
					]
				});
				break;
			case 'players':
				sections.push({
					title: 'Jugadors seleccionats',
					items: [
						{ keys: ['⌫'], label: 'Selecciona la pàgina' },
						{ keys: ['k'], label: 'Regnes dels jugadors' },
						{ keys: ['c'], label: 'Cartes dels jugadors' },
						{ keys: ['←', '↑', '↓', '→'], label: 'Mou-te per la graella' },
						{ keys: ['Home', 'End'], label: 'Primer / últim jugador' }
					]
				});
				break;
			case 'cards':
				sections.push({
					title: 'Cartes seleccionades',
					items: [
						{ keys: ['⌫'], label: 'Selecciona la pàgina' },
						{ keys: ['k'], label: 'Regnes de les cartes' },
						{ keys: ['p'], label: 'Jugadors propietaris' },
						{ keys: ['←', '↑', '↓', '→'], label: 'Mou-te per la graella' },
						{ keys: ['Home', 'End'], label: 'Primera / última carta' },
						{ keys: ['f'], label: 'Filtra per tipus' }
					]
				});
				break;
		}

		const actions: Array<CueItem> = [{ keys: ['n'], label: 'Afegeix regnes o jugadors' }];
		const canAcquire =
			this.selection.players.size > 0 ||
			[...this.selection.kingdoms].some((id) => id !== independentKingdomId);
		if (canAcquire) {
			actions.push({ keys: ['a'], label: 'Adquireix cartes' });
			actions.push({ keys: ['Del'], label: 'Elimina la selecció' });
		} else if (this.selection.cards.size > 0) {
			actions.push({ keys: ['a'], label: 'Cartes dels jugadors propietaris' });
		}
		if (this.hasCounterTargets) {
			const scope =
				this.hasResourceTargets && this.hasStatTargets
					? 'recurs o estat'
					: this.hasResourceTargets
						? 'recurs'
						: 'estat';
			actions.push({ keys: ['+'], label: `Incrementa ${scope}` });
			actions.push({ keys: ['-'], label: `Disminueix ${scope}` });
			actions.push({ keys: ['='], label: `Estableix ${scope}` });
		}
		if (this.selection.cards.size > 0) {
			actions.push({ keys: ['d'], label: 'Descarta' });
			actions.push({ keys: ['r'], label: 'Retorna a la baralla' });
		}
		if (this.canOpenPlan) actions.push({ keys: ['l'], label: 'Planifica el torn' });

		if (!this.resolution.active && this.resolution.steps.length > 0) {
			actions.push({ keys: ['Espai'], label: 'Resol el torn' });
		}

		if (actions.length > 0) sections.push({ title: 'Accions', items: actions });
		return sections;
	}

	readonly handleKeyDown = (event: KeyboardEvent) => {
		const before = this.selectionToken();
		this.handleKey(event);
		// Keep the focus on the first selected element, as the selection is keyboard driven.
		if (this.selectionToken() !== before) this.focusSelection();
	};

	private selectionToken(): string {
		return [
			[...this.selection.kingdoms].join(),
			[...this.selection.players].join(),
			[...this.selection.cards].join()
		].join('|');
	}

	/** Focuses the first element of the selection, in the order it is rendered. */
	private focusSelection(): void {
		const first = this.firstSelection();
		if (first) {
			revealElement(first.kind, first.id);
			return;
		}

		// Nothing is selected any more: drop the focus from the element that still has it.
		const active = document.activeElement;
		if (active instanceof HTMLElement && active.matches(selectableSelector)) active.blur();
	}

	private firstSelection(): { kind: SelectionKind; id: string } | null {
		switch (this.view) {
			case 'kingdoms': {
				const id = kingdomIdsInOrder(this.simulator).find((k) => this.selection.kingdoms.has(k));
				return id ? { kind: 'kingdom', id } : null;
			}
			case 'players': {
				const player = orderedPlayers(this.simulator).find((p) => this.selection.players.has(p.id));
				return player ? { kind: 'player', id: player.id } : null;
			}
			case 'cards': {
				const entry = orderedCards(this.simulator).find((c) => this.selection.cards.has(c.uid));
				return entry ? { kind: 'card', id: entry.uid } : null;
			}
			default:
				return null;
		}
	}

	private handleKey(event: KeyboardEvent): void {
		const key = event.key;

		// Keys typed into a control belong to it, so its text can be edited even while the
		// plan modal is open.
		if (isEditableTarget(event.target)) return;

		// The plan modal captures the keyboard, so no shortcut acts behind it. It closes on
		// Escape through its own listener, and on `l` through this shortcut.
		if (this.plans.playerId) {
			if (key === 'l') {
				this.plans.close();
				event.preventDefault();
			}
			return;
		}

		if (event.defaultPrevented || event.repeat || event.isComposing) return;
		if (isModifierKey(event.key)) return;
		if (event.altKey || event.ctrlKey || event.metaKey) return;

		if (key === 'Escape') {
			if (this.pending) {
				this.pending = null;
				event.preventDefault();
			} else if (this.resolution.active) {
				this.resolution.stop();
				event.preventDefault();
			}
			return;
		}

		if (this.pending) {
			if (this.handlePending(key)) event.preventDefault();
			return;
		}

		if (key === ' ') {
			this.stepThroughResolution(event.shiftKey);
			event.preventDefault();
			return;
		}

		if ((key === '+' || key === '-' || key === '=') && this.hasCounterTargets) {
			this.pending =
				key === '='
					? { kind: 'set', amount: '' }
					: { kind: 'adjust', direction: key === '+' ? 1 : -1, amount: '' };
			event.preventDefault();
			return;
		}

		switch (key) {
			case 'Backspace':
				this.selection.clear();
				event.preventDefault();
				return;
			case 'Delete':
				this.deleteSelected();
				event.preventDefault();
				return;
			case 'ArrowLeft':
				this.navigate('left');
				event.preventDefault();
				return;
			case 'ArrowRight':
				this.navigate('right');
				event.preventDefault();
				return;
			case 'ArrowUp':
				this.navigate('up');
				event.preventDefault();
				return;
			case 'ArrowDown':
				this.navigate('down');
				event.preventDefault();
				return;
			case 'Home':
				this.navigateEdge('first');
				event.preventDefault();
				return;
			case 'End':
				this.navigateEdge('last');
				event.preventDefault();
				return;
			case 'k':
				this.selectKingdoms();
				return;
			case 'p':
				this.selectPlayers();
				return;
			case 'c':
				this.selectCards();
				return;
			case 'a':
				this.handleAll();
				return;
			case 'f':
				if (this.selection.cards.size > 0) this.pending = { kind: 'filter' };
				return;
			case 'd':
				this.discardSelected();
				return;
			case 'r':
				this.returnSelected();
				return;
			case 'n':
				this.pending = { kind: 'create', amount: '' };
				return;
			case 'l':
				this.openPlan();
				return;
		}
	}

	/** Starts the resolution, or moves through its steps once it has started. */
	private stepThroughResolution(backwards: boolean): void {
		if (!this.resolution.active) {
			this.resolution.start();
			return;
		}

		if (backwards) this.resolution.previous();
		else if (this.resolution.current?.kind === 'crisis') {
			this.simulator.payCrisisContributions(this.resolution.current.kingdomId);
		} else if (this.resolution.current?.kind === 'assets-bid') {
			this.simulator.resolveAssetBids(this.resolution.current.acquisitionIndex);
		} else this.resolution.next();
	}

	private openPlan(): void {
		if (!this.canOpenPlan) return;
		const [playerId] = this.selection.players;
		this.plans.open(playerId);
	}

	private handlePending(key: string): boolean {
		const pending = this.pending;
		if (!pending) return false;

		if (pending.kind === 'filter') {
			if (isTypeKey(key)) {
				this.applyFilter(key);
				this.pending = null;
				return true;
			}
			this.pending = null;
			return key === 'Backspace';
		}

		if (pending.kind === 'acquire') {
			if (/^[0-9]$/.test(key)) {
				if (pending.amount === '' && key === '0') return true;
				if (pending.amount.length < 3) pending.amount += key;
				return true;
			}

			if (isConcreteTypeKey(key)) {
				const amount = pending.amount ? Number(pending.amount) : 1;
				this.acquire(amount, key);
				this.pending = null;
				return true;
			}

			this.pending = null;
			return false;
		}

		if (pending.kind === 'create') {
			if (/^[0-9]$/.test(key)) {
				if (pending.amount === '' && key === '0') return true;
				if (pending.amount.length < 3) pending.amount += key;
				return true;
			}

			if (key === 'k' || key === 'p') {
				const amount = pending.amount ? Number(pending.amount) : 1;
				this.create(key === 'k' ? 'kingdom' : 'player', amount);
				this.pending = null;
				return true;
			}

			this.pending = null;
			return false;
		}

		if (/^[0-9]$/.test(key)) {
			if (pending.amount.length < 3) pending.amount += key;
			return true;
		}

		if (
			!isCounterShortcutKey(key) ||
			!counterShortcutApplies(key, this.hasResourceTargets, this.hasStatTargets)
		) {
			this.pending = null;
			return false;
		}

		if (pending.kind === 'set') {
			if (pending.amount === '') {
				this.pending = null;
				return false;
			}
			this.applyCounters(key, Number(pending.amount), 'set');
		} else {
			const amount = pending.amount ? Number(pending.amount) : 1;
			this.applyCounters(key, amount, pending.direction === 1 ? 'add' : 'subtract');
		}

		this.pending = null;
		return true;
	}

	private typeCues(concreteOnly: boolean): Array<CueItem> {
		const keys: ReadonlyArray<TypeKey> = concreteOnly
			? concreteTypeKeys
			: [...concreteTypeKeys, ...nonConcreteTypeKeys];
		return keys.map((key) => ({ keys: [key], label: typeLabel(key) }));
	}

	private counterCues(): Array<CueItem> {
		return counterShortcuts(this.hasResourceTargets, this.hasStatTargets).map(({ key, label }) => ({
			keys: [key],
			label
		}));
	}

	private selectedPlayerStates(): Array<PlayerState> {
		return this.simulator.players.filter((player) => this.selection.players.has(player.id));
	}

	private selectedCardEntries(): Array<CardEntry> {
		return orderedCards(this.simulator).filter((entry) => this.selection.cards.has(entry.uid));
	}

	private groupsForSelection(): Set<string> {
		switch (this.view) {
			case 'kingdoms':
				return new SvelteSet(this.selection.kingdoms);
			case 'players':
				return groupIdsOfPlayers(this.selectedPlayerStates());
			case 'cards':
				return groupsOfCards(this.selectedCardEntries());
			default:
				return new SvelteSet<string>();
		}
	}

	private selectKingdom(id: string): void {
		this.selection.replace('kingdom', [id]);
		revealElement('kingdom', id);
	}

	private selectPlayer(id: string): void {
		this.selection.replace('player', [id]);
		revealElement('player', id);
	}

	private selectCard(uid: string): void {
		this.selection.replace('card', [uid]);
		revealElement('card', uid);
	}

	private navigate(direction: Direction): void {
		switch (this.view) {
			case 'kingdoms':
				this.navigateFromKingdoms(direction);
				return;
			case 'players':
				this.navigateFromPlayers(direction);
				return;
			case 'cards':
				this.navigateFromCards(direction);
				return;
		}
	}

	/**
	 * Kingdoms are laid out in a row: sideways moves select the adjacent panel, and vertical
	 * ones enter the grid of players. Leaving the row selects the page, their parent.
	 */
	private navigateFromKingdoms(direction: Direction): void {
		const order = kingdomIdsInOrder(this.simulator);
		const selected = this.groupsForSelection();
		const pivot = order.find((id) => selected.has(id));
		if (!pivot) return;

		switch (direction) {
			case 'up':
				this.selectKingdomPlayer('last');
				return;
			case 'down':
				this.selectKingdomPlayer('first');
				return;
		}

		const origin = rectOf('kingdom', pivot);
		const neighbour = origin
			? neighbourInDirection(origin, null, visibleItems('kingdom'), direction)
			: null;
		if (neighbour) return this.selectKingdom(neighbour);

		this.selection.clear();
	}

	private navigateFromPlayers(direction: Direction): void {
		const groups = groupIdsOfPlayers(this.selectedPlayerStates());
		const scope = playersInGroups(this.simulator, groups);
		const pivot = scope.find((player) => this.selection.players.has(player.id));
		if (!pivot) return;

		const origin = rectOf('player', pivot.id);
		const neighbour = origin
			? neighbourInDirection(origin, gridOf('player', pivot.id), visibleItems('player'), direction)
			: null;
		if (neighbour) return this.selectPlayer(neighbour);

		this.selectKingdom(groupIdOfPlayer(pivot));
	}

	private navigateFromCards(direction: Direction): void {
		const scope = cardScope(this.simulator, this.selection.cards);
		const pivot = scope.find((entry) => this.selection.cards.has(entry.uid));
		if (!pivot) return;

		const origin = rectOf('card', pivot.uid);
		const neighbour = origin
			? neighbourInDirection(origin, gridOf('card', pivot.uid), visibleItems('card'), direction)
			: null;
		if (neighbour) return this.selectCard(neighbour);

		if (direction === 'down' && this.selectNextPlayerCard(pivot)) return;
		this.selectCardOwner(pivot);
	}

	/** Selects the player owning a card, or its kingdom for cards that belong to a kingdom. */
	private selectCardOwner(entry: CardEntry): void {
		if (entry.playerId) return this.selectPlayer(entry.playerId);
		if (entry.kingdomId) this.selectKingdom(entry.kingdomId);
	}

	/**
	 * Continues below a card list: to the first card of the next player of the group, or to
	 * the kingdom when the player is the last one. Returns whether a card was selected.
	 */
	private selectNextPlayerCard(entry: CardEntry): boolean {
		if (!entry.playerId) return false;

		const owner = this.simulator.players.find((player) => player.id === entry.playerId);
		if (!owner) return false;

		const groupId = groupIdOfPlayer(owner);
		const group = kingdomGroups(this.simulator).find((candidate) => candidate.id === groupId);
		const players = group?.players ?? [];
		const index = players.findIndex((player) => player.id === owner.id);

		for (const player of players.slice(index + 1)) {
			const first = orderedCards(this.simulator).find((card) => card.playerId === player.id);
			if (!first) continue;

			this.selectCard(first.uid);
			return true;
		}

		this.selectKingdom(groupId);
		return true;
	}

	private selectKingdomPlayer(edge: 'first' | 'last'): void {
		const players = playersInGroups(this.simulator, new SvelteSet(this.selection.kingdoms));
		if (players.length === 0) return;

		const player = edge === 'first' ? players[0] : players[players.length - 1];
		this.selectPlayer(player.id);
	}

	private navigateEdge(edge: 'first' | 'last'): void {
		switch (this.view) {
			case 'kingdoms': {
				const order = kingdomIdsInOrder(this.simulator);
				const id = edge === 'first' ? order[0] : order[order.length - 1];
				this.selectKingdom(id);
				return;
			}
			case 'players': {
				const groups = groupIdsOfPlayers(this.selectedPlayerStates());
				const scope = playersInGroups(this.simulator, groups);
				if (scope.length === 0) return;
				const player = edge === 'first' ? scope[0] : scope[scope.length - 1];
				this.selectPlayer(player.id);
				return;
			}
			case 'cards': {
				const scope = cardScope(this.simulator, this.selection.cards);
				if (scope.length === 0) return;
				const entry = edge === 'first' ? scope[0] : scope[scope.length - 1];
				this.selectCard(entry.uid);
				return;
			}
		}
	}

	private selectKingdoms(): void {
		switch (this.view) {
			case 'page':
				this.selection.replace('kingdom', kingdomIdsInOrder(this.simulator));
				return;
			case 'players': {
				const groups = groupIdsOfPlayers(this.selectedPlayerStates());
				this.selectGroups(groups);
				return;
			}
			case 'cards': {
				const groups = groupsOfCards(this.selectedCardEntries());
				this.selectGroups(groups);
				return;
			}
		}
	}

	private selectGroups(groups: ReadonlySet<string>): void {
		const order = kingdomIdsInOrder(this.simulator).filter((id) => groups.has(id));
		if (order.length > 0) this.selection.replace('kingdom', order);
	}

	private selectPlayers(): void {
		switch (this.view) {
			case 'page':
				this.selection.replace(
					'player',
					orderedPlayers(this.simulator).map((player) => player.id)
				);
				return;
			case 'kingdoms': {
				const players = playersInGroups(this.simulator, new SvelteSet(this.selection.kingdoms));
				if (players.length > 0)
					this.selection.replace(
						'player',
						players.map((p) => p.id)
					);
				return;
			}
			case 'cards': {
				const players = playerIdsOfCards(this.selectedCardEntries());
				if (players.size > 0) this.selection.replace('player', players);
				return;
			}
		}
	}

	private selectCards(): void {
		switch (this.view) {
			case 'page':
				this.selection.replace(
					'card',
					orderedCards(this.simulator).map((entry) => entry.uid)
				);
				return;
			case 'kingdoms': {
				const entries = cardsOfGroups(this.simulator, new SvelteSet(this.selection.kingdoms));
				if (entries.length > 0)
					this.selection.replace(
						'card',
						entries.map((e) => e.uid)
					);
				return;
			}
			case 'players': {
				const entries = cardsOfPlayers(this.simulator, new SvelteSet(this.selection.players));
				if (entries.length > 0)
					this.selection.replace(
						'card',
						entries.map((e) => e.uid)
					);
				return;
			}
		}
	}

	private handleAll(): void {
		const hasAcquireTarget =
			this.selection.players.size > 0 ||
			[...this.selection.kingdoms].some((id) => id !== independentKingdomId);

		if (hasAcquireTarget) {
			this.pending = { kind: 'acquire', amount: '' };
			return;
		}

		if (this.selection.cards.size === 0) return;
		const players = playerIdsOfCards(this.selectedCardEntries());
		if (players.size === 0) return;

		const entries = cardsOfPlayers(this.simulator, players);
		this.selection.replace(
			'card',
			entries.map((entry) => entry.uid)
		);
	}

	private applyFilter(key: TypeKey): void {
		const matching = this.selectedCardEntries()
			.filter((entry) => matchesType(entry.card, key))
			.map((entry) => entry.uid);

		if (matching.length === 0) {
			this.selection.clear();
			return;
		}
		this.selection.replace('card', matching);
	}

	private create(kind: 'kingdom' | 'player', amount: number): void {
		if (amount <= 0) return;

		if (kind === 'kingdom') {
			const kingdomIds: Array<string> = [];
			for (let index = 0; index < amount; index += 1) {
				kingdomIds.push(this.simulator.addKingdom());
			}
			this.selection.replace('kingdom', kingdomIds);
			revealElement('kingdom', kingdomIds[0]);
			return;
		}

		const targetKingdomIds = kingdomIdsInOrder(this.simulator).filter(
			(id) => id !== independentKingdomId && this.selection.kingdoms.has(id)
		);
		const playerIds: Array<string> = [];
		const kingdoms = targetKingdomIds.length > 0 ? targetKingdomIds : [null];
		for (const kingdomId of kingdoms) {
			for (let index = 0; index < amount; index += 1) {
				playerIds.push(this.simulator.addPlayer(kingdomId));
			}
		}

		this.selection.replace('player', playerIds);
		revealElement('player', playerIds[0]);
	}

	private acquire(amount: number, type: ConcreteTypeKey): void {
		const playerIds = [...this.selection.players];
		const kingdomIds = [...this.selection.kingdoms].filter((id) => id !== independentKingdomId);
		if (playerIds.length === 0 && kingdomIds.length === 0) return;

		this.simulator.acquireCards({ playerIds, kingdomIds }, amount, type);
		this.selection.prune(this.simulator);
	}

	private applyCounters(
		key: CounterShortcutKey,
		amount: number,
		mode: 'add' | 'subtract' | 'set'
	): void {
		const resource = key === 'a' ? null : resourceOfShortcut(key);
		const stat = key === 'a' ? null : statOfShortcut(key);

		for (const playerId of this.selection.players) {
			if (key !== 'a' && !resource) continue;
			if (mode === 'set') {
				this.simulator.setResources(playerId, resource, amount);
			} else {
				this.simulator.adjustResources(playerId, resource, mode === 'add' ? amount : -amount);
			}
		}

		for (const kingdomId of [...this.selection.kingdoms]) {
			if (kingdomId === independentKingdomId) continue;
			if (key !== 'a' && !stat) continue;
			if (mode === 'set') {
				this.simulator.setStats(kingdomId, stat, amount);
			} else {
				this.simulator.adjustStats(kingdomId, stat, mode === 'add' ? amount : -amount);
			}
		}
	}

	private discardSelected(): void {
		if (this.selection.cards.size === 0) return;
		this.simulator.discardCards([...this.selection.cards]);
		this.selection.cards.clear();
		this.selection.prune(this.simulator);
	}

	private returnSelected(): void {
		if (this.selection.cards.size === 0) return;
		this.simulator.returnCardsToDecks([...this.selection.cards]);
		this.selection.cards.clear();
		this.selection.prune(this.simulator);
	}

	private deleteSelected(): void {
		if (this.selection.players.size === 0 && this.selection.kingdoms.size === 0) return;

		const playerIds = [...this.selection.players];
		const kingdomIds = [...this.selection.kingdoms].filter((id) => id !== independentKingdomId);

		for (const playerId of playerIds) this.simulator.removePlayer(playerId);
		for (const kingdomId of kingdomIds) this.simulator.removeKingdom(kingdomId);

		this.selection.players.clear();
		this.selection.kingdoms.clear();
		this.selection.prune(this.simulator);
	}
}
