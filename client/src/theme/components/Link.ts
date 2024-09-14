import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';

const brandLink = defineStyle({
	color: 'brand.primary',
	textDecoration: 'none',
	fontWeight: 'normal',
});

export const linkTheme = defineStyleConfig({
	variants: { brandLink },
	defaultProps: {
		size: 'md',
		variant: 'brandLink',
		colorScheme: 'customBlue',
	},
});
