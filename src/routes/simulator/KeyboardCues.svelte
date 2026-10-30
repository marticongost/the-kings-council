<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		panel: {
			position: 'fixed',
			right: css.spacing.md,
			bottom: css.spacing.md,
			zIndex: 110,
			display: 'flex',
			flexDirection: 'column',
			gap: css.spacing.sm,
			maxWidth: '28em',
			maxHeight: '80vh',
			overflowY: 'auto',
			padding: css.spacing.md,
			border: `1px solid ${css.palette.gurkha}`,
			borderRadius: css.spacing.sm,
			backgroundColor: 'rgba(250, 249, 242, 0.9)',
			backdropFilter: 'blur(3px)',
			boxShadow: '0 0.25em 1em rgba(0, 0, 0, 0.2)',
			color: css.palette.wood,
			fontFamily: css.fonts.text,
			pointerEvents: 'none',
			transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
		},
		hidden: {
			opacity: 0,
			transform: 'translateY(0.5em)'
		},
		section: {
			...css.column('xs')
		},
		sectionTitle: {
			margin: 0,
			fontFamily: css.fonts.heading,
			fontSize: '0.85em',
			fontWeight: 900,
			color: css.palette.red
		},
		list: {
			margin: 0,
			padding: 0,
			listStyle: 'none',
			display: 'grid',
			gap: '0.15em'
		},
		row: {
			display: 'grid',
			gridTemplateColumns: 'auto 1fr',
			alignItems: 'center',
			gap: css.spacing.sm,
			fontSize: '0.8em'
		},
		keys: {
			display: 'flex',
			gap: '0.15em'
		},
		key: {
			whiteSpace: 'nowrap',
			padding: '0.05em 0.35em',
			border: `1px solid ${css.palette.gurkha}`,
			borderBottomWidth: '2px',
			borderRadius: '0.25em',
			backgroundColor: css.palette.white,
			color: css.palette.cedar,
			fontFamily: css.fonts.number,
			fontSize: '0.9em',
			fontWeight: 700
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import type { KeyboardController } from './keyboard.svelte';

	interface Props {
		controller: KeyboardController;
		hidden?: boolean;
	}

	const { controller, hidden = false }: Props = $props();

	const cues = $derived(controller.cues);
</script>

<aside
	class={cx(styles.panel, hidden && styles.hidden)}
	aria-label="Dreceres de teclat"
	aria-live="polite"
	aria-hidden={hidden ? 'true' : undefined}
>
	{#each cues as section (section.title)}
		<section class={styles.section}>
			<h4 class={styles.sectionTitle}>{section.title}</h4>
			<ul class={styles.list}>
				{#each section.items as item (`${section.title}-${item.label}`)}
					<li class={styles.row}>
						<span class={styles.keys}>
							{#each item.keys as key (key)}
								<kbd class={styles.key}>{key}</kbd>
							{/each}
						</span>
						<span>{item.label}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</aside>
