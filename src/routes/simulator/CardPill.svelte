<script lang="ts" module>
	import * as css from '#lib/styles';
	import type { CardBackgroundName } from '#lib/cardattributes';

	interface PillColors {
		background: string;
		color: string;
	}

	// Solid colours taken from the header gradients of the card-backgrounds artwork,
	// picking the shade that keeps the pill text readable.
	const pillColors: Record<CardBackgroundName, PillColors> = {
		common: { background: '#495b62', color: css.palette.white },
		office: { background: '#9f5757', color: css.palette.white },
		'collective-goal': { background: '#dfcba7', color: css.palette.cedar },
		'personal-goal': { background: '#c4ae99', color: css.palette.cedar },
		event: { background: '#6e846f', color: css.palette.white },
		crisis: { background: css.palette.crisis, color: css.palette.white },
		law: { background: '#987f98', color: css.palette.white },
		tactic: { background: '#616f95', color: css.palette.white },
		asset: { background: '#bdb8a7', color: css.palette.cedar },
		'hidden-asset': { background: '#696057', color: css.palette.white },
		house: { background: '#d4d2c7', color: css.palette.cedar }
	};

	// The popup is positioned against the viewport to escape zone overflow, so the
	// full-scale card dimensions are needed in pixels. CSS defines 1mm as 96/25.4px.
	const mmToPx = 96 / 25.4;
	const popupOffset = 4;
	const viewportMargin = 8;

	interface PopupPlacement {
		top: number;
		left: number;
	}

	const styles = css.styles({
		wrapper: {
			position: 'relative',
			display: 'flex',
			minWidth: 0,
			maxWidth: '100%'
		},
		pill: {
			...css.row('xs'),
			minWidth: 0,
			maxWidth: '100%',
			flex: '1 1 auto',
			...css.hpadding('md'),
			...css.vpadding('sm'),
			borderRadius: '0.3em',
			border: '2px solid transparent',
			fontFamily: css.fonts.text,
			fontSize: '0.85em',
			fontWeight: 700,
			lineHeight: 1.4,
			cursor: 'grab',
			userSelect: 'none',
			'&:focus-visible': {
				outline: `2px solid ${css.palette.cedar}88`,
				outlineOffset: '-2px'
			}
		},
		staticPill: {
			cursor: 'default'
		},
		selectedPill: {
			borderColor: `${css.palette.cedar}88`,
			boxShadow: `0 0 0 4px ${css.palette.carrara}`
		},
		icon: {
			height: '1.3em',
			width: 'auto',
			flexShrink: 0
		},
		title: {
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		popup: {
			position: 'fixed',
			zIndex: 50,
			borderRadius: '1mm',
			overflow: 'hidden',
			boxShadow: `0 0 0 0.2mm ${css.palette.gurkha}, 0 1mm 3mm rgba(0, 0, 0, 0.35)`
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { getCapabilityTitle, getCardBackgroundName, getCardIcon } from '#lib/cardattributes';
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import CardFront from '#lib/components/CardFront.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import type { Card } from '#lib/models/cards';
	import { useSelection } from './selection.svelte';
	import { officeDragMime, simulatorDragMime, type DragPayload, type Zone } from './types';

	interface Props {
		card?: Card;
		cardCapability?: CardCapability;
		source?: Zone;
		uid?: string;
		style?: string;
	}

	const { card, cardCapability, source, uid, style }: Props = $props();

	const selection = useSelection();
	const selected = $derived(uid ? selection.cards.has(uid) : false);

	const subject = $derived(card ?? cardCapability?.card);
	const colors = $derived(subject ? pillColors[getCardBackgroundName(subject)] : pillColors.common);
	const title = $derived(
		cardCapability ? getCapabilityTitle(cardCapability.capability) : subject?.title
	);

	let wrapper = $state<HTMLDivElement>();
	let pill = $state<HTMLButtonElement>();

	let open = $state(false);
	let popupPosition = $state<PopupPlacement | null>(null);

	const popupCardSize = $derived(card ? css.cards.standard : css.cards.mini);
	const popupWidth = $derived(popupCardSize.width * mmToPx);
	const popupHeight = $derived(popupCardSize.height * mmToPx);

	function placePopup() {
		if (!pill) return;
		const rect = pill.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const clamp = (value: number, max: number) =>
			Math.min(Math.max(viewportMargin, value), Math.max(viewportMargin, max));
		const clampLeft = (left: number) => clamp(left, viewportWidth - popupWidth - viewportMargin);
		const clampTop = (top: number) => clamp(top, viewportHeight - popupHeight - viewportMargin);

		const below = rect.bottom + popupOffset;
		const above = rect.top - popupOffset - popupHeight;
		const sideTop = clampTop(rect.top + rect.height / 2 - popupHeight / 2);

		const fits = ({ top, left }: PopupPlacement) =>
			top >= viewportMargin &&
			left >= viewportMargin &&
			top + popupHeight <= viewportHeight - viewportMargin &&
			left + popupWidth <= viewportWidth - viewportMargin;

		// Prefer below the pill, then above it, then beside it (vertically centred), so
		// the card stays fully on screen. Positions are only clamped when even a side
		// placement does not fit the viewport.
		const placements: PopupPlacement[] = [
			{ top: below, left: clampLeft(rect.left) },
			{ top: above, left: clampLeft(rect.left) },
			{ top: sideTop, left: rect.right + popupOffset },
			{ top: sideTop, left: rect.left - popupOffset - popupWidth }
		];

		popupPosition = placements.find(fits) ?? { top: clampTop(below), left: clampLeft(rect.left) };
	}

	function closePopup() {
		open = false;
	}

	function togglePopup() {
		if (open) {
			closePopup();
			return;
		}
		open = true;
		placePopup();
	}

	function onClick(event: MouseEvent) {
		event.stopPropagation();
		if (uid) {
			if (event.ctrlKey || event.metaKey) {
				selection.toggle('card', uid);
				return;
			}
			selection.replace('card', [uid]);
		}
		togglePopup();
	}

	$effect(() => {
		if (!open) return;

		const onPointerDown = (event: PointerEvent) => {
			if (event.target instanceof Node && wrapper?.contains(event.target)) return;
			closePopup();
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePopup();
		};

		window.addEventListener('resize', placePopup);
		window.addEventListener('scroll', placePopup, true);
		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('resize', placePopup);
			window.removeEventListener('scroll', placePopup, true);
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	// Keyboard navigation moves the selection away from the pill that shows a preview.
	$effect(() => {
		if (!selected) closePopup();
	});

	function onDragStart(event: DragEvent) {
		if (!source || !event.dataTransfer) {
			event.preventDefault();
			return;
		}
		closePopup();
		const payload: DragPayload = { source, uid };
		const data = JSON.stringify(payload);
		event.dataTransfer.setData(simulatorDragMime, data);
		if (card?.type === 'office') {
			event.dataTransfer.setData(officeDragMime, data);
		}
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

{#if subject}
	<div class={styles.wrapper} bind:this={wrapper} role="listitem" data-simulator-card={uid} {style}>
		<button
			class={cx(styles.pill, !source && styles.staticPill, selected && styles.selectedPill)}
			style:background-color={colors.background}
			style:color={colors.color}
			type="button"
			draggable={Boolean(source)}
			bind:this={pill}
			ondragstart={onDragStart}
			onclick={onClick}
			aria-expanded={open}
			aria-pressed={selected}
			{title}
		>
			<InlineSvg class={styles.icon} src={getCardIcon(subject)} aria-hidden="true" />
			<span class={styles.title}>{title}</span>
		</button>
		{#if open && popupPosition}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class={styles.popup}
				style:top={`${popupPosition.top}px`}
				style:left={`${popupPosition.left}px`}
				role="dialog"
				aria-label={title}
				tabindex="-1"
				onclick={(event) => event.stopPropagation()}
			>
				{#if card}
					<CardFront {card} />
				{:else if cardCapability}
					<CardCapabilityFront {cardCapability} />
				{/if}
			</div>
		{/if}
	</div>
{/if}
