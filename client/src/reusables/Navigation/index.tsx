import { useDisclosure, Box, Drawer, DrawerContent } from '@chakra-ui/react';
import MobileNav from './MobileNav';
import SidebarContent from './SideBarContent';

const Navigation = ({ children, linkItems }: IContent) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<Box w="100%" h="full">
			<SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} linkItems={linkItems} />
			<Drawer isOpen={isOpen} placement="left" onClose={onClose} returnFocusOnClose={false} onOverlayClick={onClose}>
				<DrawerContent>
					<SidebarContent onClose={onClose} linkItems={linkItems} />
				</DrawerContent>
			</Drawer>
			<MobileNav onOpen={onOpen} />
			<Box ml={{ base: 0, md: 20, xl: 60 }} h="full">
				{children}
			</Box>
		</Box>
	);
};

export default Navigation;
