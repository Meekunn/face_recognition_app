import { Box, Button, Flex, CloseButton, Heading, BoxProps, Text } from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';
import NavItem from './NavItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { LinkItemProps } from './types';
import '@fontsource/pacifico';
import { authPaths } from '../../routes/paths';

interface SidebarProps extends BoxProps {
	onClose: () => void;
	linkItems: LinkItemProps[];
}

const SidebarContent = ({ onClose, linkItems, ...rest }: SidebarProps) => {
	const location = useLocation();
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('isAuthenticated');
		navigate(authPaths.SIGNIN);
	};

	return (
		<Box
			bg="white"
			boxShadow="0px 1px 3px 0px rgba(0, 0, 0, 0.10)"
			w={{ base: 'full', md: '80px', xl: '240px' }}
			pos="fixed"
			h="full"
			{...rest}
		>
			<Flex alignItems="flex-start" justifyContent="space-around" py={4}>
				<Flex direction="column" align="center" gap={2}>
					<Heading as="h1" fontSize="3xl" fontFamily={"'Pacifico', cursive"} color="brand.textDark" mt={4}>
						At<span style={{ color: '#0050C8' }}>tend</span>iT
					</Heading>
				</Flex>
				<CloseButton display={{ base: 'flex', md: 'none' }} position="absolute" right="10px" top="10px" onClick={onClose} />
			</Flex>
			<Flex py={3} direction="column" gap={2}>
				{linkItems
					.filter(({ position }) => position !== 'bottom')
					.map(({ title, icon, path }: LinkItemProps) => {
						const isActive = path.split('/')[2] === location.pathname.split('/')[2];
						return (
							<NavItem key={title} icon={icon} href={path} active={isActive}>
								{title}
							</NavItem>
						);
					})}
			</Flex>
			<Flex direction="column" align="center" w="100%" position="absolute" bottom="15px" px={0}>
				{linkItems
					.filter(({ position }) => position === 'bottom')
					.map(({ title, icon, path }: LinkItemProps) => {
						const isActive = path.split('/')[2] === location.pathname.split('/')[2];
						return (
							<NavItem key={title} icon={icon} href={path} active={isActive}>
								{title}
							</NavItem>
						);
					})}
				<Button
					leftIcon={<FiLogOut />}
					width={{ base: '280px', md: 'auto', xl: '224px' }}
					variant="ghost"
					justifyContent="flex-start"
					colorScheme="gray"
					color="brand.textDark"
					onClick={handleLogout}
				>
					<Text display={{ base: 'block', md: 'none', xl: 'block' }}>Logout</Text>
				</Button>
			</Flex>
		</Box>
	);
};

export default SidebarContent;
