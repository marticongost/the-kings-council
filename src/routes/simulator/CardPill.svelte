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
		office: { background: '#923b3b', color: css.palette.white },
		'collective-goal': { background: '#d7b489', color: css.palette.cedar },
		'personal-goal': { background: '#bfa68f', color: css.palette.cedar },
		event: { background: '#406d43', color: css.palette.white },
		crisis: { background: '#812925', color: css.palette.white },
		law: { background: '#7f477f', color: css.palette.white },
		tactic: { background: '#4f5b7e', color: css.palette.white },
		asset: { background: '#bdb8a7', color: css.palette.cedar },
		'hidden-asset': { background: '#59514a', color: css.palette.white },
		house: { background: '#c2c2a4', color: css.palette.cedar }
	};

	// The popup is positioned against the viewport to escape zone overflow, so the
	// full-scale card width is needed in pixels. CSS defines 1mm as 96/25.4px.
	const popupWidth = (css.cards.standard.width * 96) / 25.4;
	const popupOffset = 4;
	const viewportMargin = 8;

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
			...css.hpadding('md'),
			...css.vpadding('sm'),
			borderRadius: '0.3em',
			fontFamily: css.fonts.text,
			fontSize: '0.85em',
			fontWeight: 700,
			lineHeight: 1.4,
			cursor: 'grab',
			userSelect: 'none'
		},
		staticPill: {
			cursor: 'default'
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
	import { officeDragMime, simulatorDragMime, type DragPayload, type Zone } from './types';

	interface Props {
		card?: Card;
		cardCapability?: CardCapability;
		source?: Zone;
		uid?: string;
	}

	const { card, cardCapability, source, uid }: Props = $props();

	const subject = $derived(card ?? cardCapability?.card);
	const colors = $derived(subject ? pillColors[getCardBackgroundName(subject)] : pillColors.common);
	const title = $derived(
		cardCapability ? getCapabilityTitle(cardCapability.capability) : subject?.title
	);

	let wrapper = $state<HTMLDivElement>();
	let pill = $state<HTMLButtonElement>();

	let open = $state(false);
	let popupPosition = $state<{ top: number; left: number } | null>(null);

	function placePopup() {
		if (!pill) return;
		const rect = pill.getBoundingClientRect();
		const maxLeft = Math.max(viewportMargin, window.innerWidth - popupWidth - viewportMargin);
		const left = Math.min(Math.max(viewportMargin, rect.left), maxLeft);
		popupPosition = { top: rect.bottom + popupOffset, left };
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
	<div class={styles.wrapper} bind:this={wrapper} role="listitem">
		<button
			class={cx(styles.pill, !source && styles.staticPill)}
			style:background-color={colors.background}
			style:color={colors.color}
			type="button"
			draggable={Boolean(source)}
			bind:this={pill}
			ondragstart={onDragStart}
			onclick={togglePopup}
			aria-expanded={open}
			{title}
		>
			<InlineSvg class={styles.icon} src={getCardIcon(subject)} aria-hidden="true" />
			<span class={styles.title}>{title}</span>
		</button>
		{#if open && popupPosition}
			<div
				class={styles.popup}
				style:top={`${popupPosition.top}px`}
				style:left={`${popupPosition.left}px`}
				role="dialog"
				aria-label={title}
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
