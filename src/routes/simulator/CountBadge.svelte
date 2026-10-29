<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		badge: {
			position: 'absolute',
			right: 0,
			bottom: 0,
			transform: 'translate(50%, 50%)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minWidth: '1.6em',
			padding: '0.15em 0.45em',
			borderRadius: '999px',
			backgroundColor: css.palette.wood,
			color: css.palette.white,
			fontFamily: css.fonts.number,
			fontWeight: 900,
			fontSize: '0.8em',
			lineHeight: 1.2
		}
	});
</script>

<script lang="ts">
	interface Props {
		count: number;
	}

	const { count }: Props = $props();
</script>

<span class={styles.badge}>{count}</span>
