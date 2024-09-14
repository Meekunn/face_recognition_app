import React from 'react';
import { Box, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';

interface NavItemProps extends FlexProps {
	icon: IconType;
	href: string;
	linkPosition?: 'bottom' | 'top';
	children: React.ReactNode;
	active?: boolean;
}

const NavItem = ({ icon: IconComponent, href, children, active, ...rest }: NavItemProps) => {
	const navigate = useNavigate();
	return (
		<Box
			role="button"
			display="flex"
			justifyContent={'center'}
			sx={{ textDecoration: 'none' }}
			onClick={() => navigate(href)}
			w="100%"
		>
			<Flex
				gap={{ base: 4, md: 2, xl: 3 }}
				align="center"
				p="3.5"
				borderRadius="8px"
				width={{ base: '280px', md: 'auto', xl: '224px' }}
				role="group"
				cursor="pointer"
				color={active ? 'brand.primary' : 'brand.textDark'}
				bgColor={active ? 'customBlue.100' : 'transparent'}
				_hover={{
					bgColor: 'customBlue.100',
				}}
				{...rest}
			>
				<IconComponent color={active ? '#0050C8' : '#6B6C7E'} style={{ height: '20px', width: '20px' }} />
				<Text display={{ base: 'block', md: 'none', xl: 'block' }}>{children}</Text>
			</Flex>
		</Box>
	);
};

export default NavItem;
