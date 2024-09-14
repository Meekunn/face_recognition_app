import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';

const baseStyle = defineStyle({
	borderRadius: '10px', // disable the border radius
	fontWeight: 'normal',
	h: '44px',
	height: '44px',
	minW: '24px',
	minWidth: '24px',
	maxW: '344px',
});

const ghostIconBtn = defineStyle({
	bgColor: 'transparent',
	color: 'brand.textGray',
	w: '24px',
	h: '24px',
	fontSize: '2xl',

	_active: {
		color: 'black',
	},

	_hover: {
		color: 'black',
	},
});

const cancelBtn = defineStyle({
	bgColor: 'customBlue.100',
	color: 'brand.primary',
	fontWeight: 'normal',
});

export const buttonTheme = defineStyleConfig({
	baseStyle,
	variants: { cancelBtn, ghostIconBtn },
	defaultProps: {
		colorScheme: 'customBlue',
	},
});
