import { Box, Flex, Heading } from '@chakra-ui/react';

interface AuthWrapper {
	children: React.ReactNode;
}
const Auth = ({ children }: AuthWrapper) => {
	return (
		<Box
			w="100vw"
			h="100vh"
			bg="brand.primary"
			position="relative"
			overflow="hidden"
			display="flex"
			justifyContent={'center'}
			flexDirection={'column'}
			alignItems="center"
			gap={6}
		>
			<Flex direction="column" align="center" gap={2}>
				<Heading as="h1" fontSize={{ base: '3xl', md: '5xl' }} fontFamily={"'Pacifico', cursive"} color="#fff" mt={4}>
					At<span style={{ color: '#000' }}>tend</span>iT
				</Heading>
			</Flex>
			{children}
		</Box>
	);
};

export default Auth;
