import { extendTheme } from '@chakra-ui/react';
import styles from './styles';
import colors from './colors';
import components from './components';

const theme = extendTheme({
	styles,
	colors,
	components,
	fonts: {
		heading: "'Ubuntu', sans-serif",
		body: "'Ubuntu', sans-serif",
	},
});

export default theme;
