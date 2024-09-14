import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const baseStyle = defineStyle({
	fontWeight: 'semibold',
	fontSize: 'xl',
	textAlign: 'center',
});

const formHeading = defineStyle({
	color: 'brand.textDark',
	fontSize: 'xl',
	fontWeight: 'normal',
	lineHeight: '26.6px',
	width: '100%',
	textAlign: 'left',
});

export const headingTheme = defineStyleConfig({
	baseStyle,
	variants: { formHeading },
});
