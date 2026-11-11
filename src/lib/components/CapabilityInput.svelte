<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		input: {
			display: 'inline-block',
			border: `1px dashed ${css.palette.dawn}`,
			verticalAlign: 'middle',
			height: '1.5em',
			borderRadius: '0.3em',
			margin: 0
		},
		editableInput: {
			display: 'inline-flex',
			alignItems: 'center',
			// Anchors the popup of the multi-value marks.
			position: 'relative'
		},
		numericInput: {
			width: '2em'
		},
		checkInput: {
			width: '1em',
			borderRadius: '0.8em',
			height: '1em'
		},
		tallyInput: {
			display: 'inline-flex',
			alignItems: 'center',
			height: 'auto',
			padding: 0,
			border: 'none'
		},
		tally: {
			display: 'inline-flex',
			alignItems: 'center',
			gap: css.spacing.sm
		},
		tallyGroup: {
			display: 'inline-flex',
			alignItems: 'center'
		},
		tallySquare: {
			boxSizing: 'border-box',
			width: '1em',
			height: '1em',
			margin: 0,
			padding: 0,
			border: `1px dashed ${css.palette.dawn}`,
			backgroundColor: 'transparent'
		},
		tallySquareStart: {
			borderTopLeftRadius: '0.25em',
			borderBottomLeftRadius: '0.25em'
		},
		tallySquareEnd: {
			borderTopRightRadius: '0.25em',
			borderBottomRightRadius: '0.25em'
		},
		// Adjacent squares overlap by a border so their dashed edges coincide.
		tallySquareJoined: {
			marginLeft: '-1px'
		},
		tallySquareTicked: {
			backgroundColor: css.palette.dawn
		},
		editableTallySquare: {
			cursor: 'pointer'
		},
		textInput: {
			width: '5em'
		},
		listInput: {
			display: 'block',
			height: '4em',
			marginTop: css.spacing.xs
		},
		formatWrapper: {
			height: '1em',
			padding: '0.1em',
			borderRight: `1px solid ${css.palette.ivory}`
		},
		// In an editable mark the wrapper is a flex item, so it must size itself
		// from the icon instead of overflowing it downwards.
		editableFormatWrapper: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: 'auto'
		},
		formatIcon: {
			width: '1em',
			height: '1em',
			verticalAlign: 'middle'
		},
		kingdomInput: {
			width: '5em'
		},
		playerInput: {
			width: '5em'
		},
		playerListInput: {
			width: '100%'
		},
		resourceInput: {
			width: '2.5em'
		},
		// Editable marks hold the icon next to the control, so they need room for both.
		editableKingdomInput: {
			width: '6em'
		},
		editablePlayerInput: {
			width: '6em'
		},
		editableResourceInput: {
			width: '3em'
		},
		// A presented mark grows with the value it shows, instead of holding a control.
		presentedInput: {
			width: 'auto',
			maxWidth: '100%',
			paddingRight: '0.1em',
			overflow: 'hidden'
		},
		presentedCheck: {
			backgroundColor: css.palette.dawn
		},
		presentedValue: {
			verticalAlign: 'middle',
			whiteSpace: 'nowrap'
		},
		presentedListValue: {
			whiteSpace: 'pre-wrap',
			wordBreak: 'break-word'
		},
		control: {
			flex: '1 1 auto',
			boxSizing: 'border-box',
			width: '100%',
			minWidth: 0,
			height: '100%',
			margin: 0,
			padding: 0,
			border: 'none',
			borderRadius: 'inherit',
			backgroundColor: 'transparent',
			color: 'inherit',
			font: 'inherit',
			// The card font uses old-style figures, which look tiny in a control.
			fontVariantNumeric: 'lining-nums',
			userSelect: 'text'
		},
		select: {
			cursor: 'pointer'
		},
		checkbox: {
			appearance: 'none',
			boxSizing: 'border-box',
			width: '100%',
			height: '100%',
			margin: 0,
			padding: 0,
			border: 'none',
			borderRadius: 'inherit',
			backgroundColor: 'transparent',
			cursor: 'pointer',
			'&:checked': {
				backgroundColor: css.palette.dawn
			}
		},
		numberInput: {
			appearance: 'textfield',
			'&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
				appearance: 'none',
				margin: 0
			}
		},
		textarea: {
			display: 'block',
			resize: 'vertical'
		},
		multiTrigger: {
			display: 'block',
			textAlign: 'left',
			cursor: 'pointer',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			userSelect: 'none'
		},
		popup: {
			position: 'absolute',
			top: '100%',
			left: 0,
			zIndex: 20,
			display: 'flex',
			flexDirection: 'column',
			minWidth: 'max-content',
			maxHeight: '12em',
			overflowY: 'auto',
			marginTop: '0.2em',
			padding: '0.2em',
			border: css.forms.controlBorder,
			borderRadius: '0.3em',
			backgroundColor: css.forms.controlBackgroundColor,
			boxShadow: '0 0.2em 0.5em rgba(0, 0, 0, 0.25)',
			cursor: 'default'
		},
		popupOption: {
			display: 'flex',
			alignItems: 'center',
			gap: '0.3em',
			padding: '0.1em 0.2em',
			cursor: 'pointer',
			whiteSpace: 'nowrap',
			'&:hover': {
				backgroundColor: css.palette.ivory
			}
		},
		popupCheckbox: {
			margin: 0,
			accentColor: css.palette.dawn
		},
		popupEmpty: {
			padding: '0.1em 0.2em',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { tick } from 'svelte';
	import { defaultTallyCount, type InputChunk } from '#lib/models/effects';
	import { isResourceType } from '#lib/models/resources';
	import InlineSvg from './InlineSvg.svelte';
	import ResourceDisplay from './ResourceDisplay.svelte';
	import { useCapabilityInputs, useCapabilityInputValues } from './capabilityinputs';

	interface Props {
		format: InputChunk['format'];
		/** Sizes of the groups of squares of a `tally` input. */
		counts?: Array<number>;
		/** Renders a form control instead of an empty mark. */
		editable?: boolean;
		/** Identifies this input in the state provided by `provideCapabilityInputs`. */
		inputKey?: string;
	}

	const { format, counts = [defaultTallyCount], editable = false, inputKey }: Props = $props();

	const inputs = useCapabilityInputs();
	const givenValues = useCapabilityInputValues();
	let localValue = $state('');

	/** The values of the surrounding capability, editable or only presented. */
	const values = $derived(inputs ?? givenValues);
	const value = $derived(inputKey && values ? values.value(inputKey) : localValue);
	/** Whether the mark presents the value it was filled in with instead of an empty mark. */
	const presented = $derived(!editable && inputKey !== undefined && givenValues !== null);

	function setValue(next: string) {
		if (inputKey && inputs) inputs.setValue(inputKey, next);
		else localValue = next;
	}

	const isPlayer = $derived(
		format === 'player' ||
			format === 'players' ||
			format === 'kingdom-member' ||
			format === 'kingdom-members'
	);
	const isKingdom = $derived(format === 'kingdom');
	const choices = $derived(
		isPlayer ? (values?.players ?? []) : isKingdom ? (values?.kingdoms ?? []) : []
	);
	const isMultiPlayer = $derived(format === 'players' || format === 'kingdom-members');
	const selected = $derived(value ? value.split(',') : []);
	const selectedLabels = $derived(
		selected.map((id) => choices.find((choice) => choice.value === id)?.label ?? id).join(', ')
	);
	/** The value presented in the mark: names instead of ids, and nothing for check marks. */
	const presentedValue = $derived(
		format === 'check' || format === 'tally' ? '' : isPlayer || isKingdom ? selectedLabels : value
	);
	const presentedChecked = $derived(format === 'check' && value !== '');

	/** Number of ticked squares of each tally group, stored as comma-separated counts. */
	const tickedCounts = $derived(
		counts.map((count, group) => {
			if (format !== 'tally') return 0;
			const stored = Math.trunc(Number(value.split(',')[group]) || 0);
			return Math.min(count, Math.max(0, stored));
		})
	);

	function setTally(group: number, index: number) {
		// Clicking the last ticked square unticks it, any other ticked square keeps it and
		// clears the ones after it, and clicking an empty square ticks every square up to it.
		const ticked = tickedCounts[group] ?? 0;
		const next = index + 1 === ticked ? index : index + 1;
		const values = counts.map((_, other) => (other === group ? next : (tickedCounts[other] ?? 0)));
		setValue(values.some((count) => count > 0) ? values.join(',') : '');
	}

	const formatWrapperClass = $derived(
		cx(styles.formatWrapper, editable && styles.editableFormatWrapper)
	);

	let open = $state(false);
	let mark = $state<HTMLSpanElement>();
	let popup = $state<HTMLDivElement>();

	function toggleChoice(id: string, checked: boolean) {
		const next = selected.filter((candidate) => candidate !== id);
		if (checked) next.push(id);
		setValue(next.join(','));
	}

	// The popup closes when the pointer goes elsewhere, and Escape closes it without
	// closing the plan modal, which listens for Escape on the window.
	$effect(() => {
		if (!open) return;

		const closeOnOutside = (event: PointerEvent) => {
			if (mark && event.target instanceof Node && mark.contains(event.target)) return;
			open = false;
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			event.stopPropagation();
			open = false;
		};

		document.addEventListener('pointerdown', closeOnOutside);
		document.addEventListener('keydown', closeOnEscape, true);
		return () => {
			document.removeEventListener('pointerdown', closeOnOutside);
			document.removeEventListener('keydown', closeOnEscape, true);
		};
	});

	$effect(() => {
		if (!open) return;
		void tick().then(() => popup?.querySelector('input')?.focus());
	});
</script>

<span
	class={cx(styles.input, {
		[styles.editableInput]: editable,
		[styles.numericInput]: format === 'number',
		[styles.textInput]: format === 'text',
		[styles.listInput]: format === 'list',
		[styles.checkInput]: format === 'check',
		[styles.tallyInput]: format === 'tally',
		[styles.kingdomInput]: format === 'kingdom',
		[styles.playerInput]: format === 'player' || format === 'kingdom-member',
		[styles.playerListInput]: format === 'players' || format === 'kingdom-members',
		[styles.resourceInput]: isResourceType(format),
		[styles.editableKingdomInput]: editable && format === 'kingdom',
		[styles.editablePlayerInput]: editable && (format === 'player' || format === 'kingdom-member'),
		[styles.editableResourceInput]: editable && isResourceType(format),
		[styles.presentedInput]: presented && format !== 'check' && format !== 'tally',
		[styles.presentedCheck]: presented && presentedChecked
	})}
	bind:this={mark}
>
	{#if format === 'player'}
		<span class={formatWrapperClass}>
			<InlineSvg class={styles.formatIcon} src="keywords/player.svg" />
		</span>
	{:else if format === 'kingdom'}
		<span class={formatWrapperClass}>
			<InlineSvg class={styles.formatIcon} src="keywords/kingdom.svg" />
		</span>
	{:else if format === 'kingdom-member'}
		<span class={formatWrapperClass}>
			<InlineSvg class={styles.formatIcon} src="keywords/kingdom-member.svg" />
		</span>
	{:else if format === 'players'}
		<span class={formatWrapperClass}>
			<InlineSvg class={styles.formatIcon} src="keywords/players.svg" />
		</span>
	{:else if format === 'kingdom-members'}
		<span class={formatWrapperClass}>
			<InlineSvg class={styles.formatIcon} src="keywords/kingdom-members.svg" />
		</span>
	{:else if isResourceType(format)}
		<span class={formatWrapperClass}>
			<ResourceDisplay resource={format} />
		</span>
	{/if}
	{#if format === 'tally'}
		<span
			class={styles.tally}
			role={editable ? 'group' : undefined}
			aria-label={editable ? format : undefined}
		>
			{#each counts as count, group (group)}
				<span class={styles.tallyGroup}>
					{#each Array.from({ length: count }, (_, index) => index) as index (index)}
						{#if editable}
							<button
								type="button"
								class={cx(
									styles.tallySquare,
									index === 0 && styles.tallySquareStart,
									index === count - 1 && styles.tallySquareEnd,
									index > 0 && styles.tallySquareJoined,
									styles.editableTallySquare,
									index < (tickedCounts[group] ?? 0) && styles.tallySquareTicked
								)}
								aria-label={`${format} ${group + 1} ${index + 1}`}
								aria-pressed={index < (tickedCounts[group] ?? 0)}
								onclick={() => setTally(group, index)}
							></button>
						{:else}
							<span
								class={cx(
									styles.tallySquare,
									index === 0 && styles.tallySquareStart,
									index === count - 1 && styles.tallySquareEnd,
									index > 0 && styles.tallySquareJoined,
									index < (tickedCounts[group] ?? 0) && styles.tallySquareTicked
								)}
							></span>
						{/if}
					{/each}
				</span>
			{/each}
		</span>
	{:else if editable}
		{#if isMultiPlayer}
			<button
				type="button"
				class={cx(styles.control, styles.multiTrigger)}
				aria-label={format}
				aria-haspopup="true"
				aria-expanded={open}
				onclick={() => (open = !open)}
			>
				{selectedLabels || '—'}
			</button>
			{#if open}
				<div class={styles.popup} role="group" aria-label={format} bind:this={popup}>
					{#each choices as choice (choice.value)}
						<label class={styles.popupOption}>
							<input
								class={styles.popupCheckbox}
								type="checkbox"
								checked={selected.includes(choice.value)}
								onchange={(event) => toggleChoice(choice.value, event.currentTarget.checked)}
							/>
							<span>{choice.label}</span>
						</label>
					{:else}
						<span class={styles.popupEmpty}>—</span>
					{/each}
				</div>
			{/if}
		{:else if isPlayer || isKingdom}
			<select
				class={cx(styles.control, styles.select)}
				aria-label={format}
				{value}
				onchange={(event) => setValue(event.currentTarget.value)}
			>
				<option value="">—</option>
				{#each choices as choice (choice.value)}
					<option value={choice.value}>{choice.label}</option>
				{/each}
			</select>
		{:else if format === 'check'}
			<input
				class={styles.checkbox}
				type="checkbox"
				aria-label={format}
				checked={value !== ''}
				onchange={(event) => setValue(event.currentTarget.checked ? 'true' : '')}
			/>
		{:else if format === 'list'}
			<textarea
				class={cx(styles.control, styles.textarea)}
				aria-label={format}
				{value}
				oninput={(event) => setValue(event.currentTarget.value)}></textarea>
		{:else if format === 'number' || isResourceType(format)}
			<input
				class={cx(styles.control, styles.numberInput)}
				type="number"
				aria-label={format}
				{value}
				oninput={(event) => setValue(event.currentTarget.value)}
			/>
		{:else}
			<input
				class={styles.control}
				type="text"
				aria-label={format}
				{value}
				oninput={(event) => setValue(event.currentTarget.value)}
			/>
		{/if}
	{:else if presented && presentedValue}
		<span class={cx(styles.presentedValue, format === 'list' && styles.presentedListValue)}
			>{presentedValue}</span
		>
	{/if}
</span>
