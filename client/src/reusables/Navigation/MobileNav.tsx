import { Avatar, Flex, IconButton, FlexProps } from '@chakra-ui/react';
import { MdMenu } from 'react-icons/md';
//import { BiBell } from "react-icons/bi";

interface MobileProps extends FlexProps {
	onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
	return (
		<Flex
			bgColor="brand.headerBg"
			w="100%"
			h="64px"
			align="center"
			px={6}
			justify={{ base: 'space-between', md: 'flex-end' }}
			{...rest}
		>
			<IconButton aria-label="toggle menu" variant="ghostIconBtn" onClick={onOpen} display={{ base: 'inline-flex', md: 'none' }}>
				<MdMenu />
			</IconButton>
			<Flex gap={{ base: 6, md: 6 }} justify="flex-end">
				{/* <IconButton aria-label="notification" variant="ghostIconBtn">
          <BiBell />
        </IconButton> */}
				<Avatar name="Profile Image" />
			</Flex>
		</Flex>
	);
};

export default MobileNav;
