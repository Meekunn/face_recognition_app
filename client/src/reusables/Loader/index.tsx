import { VStack, Heading, Flex, Box } from '@chakra-ui/react';
import './loader.css';

const Loader = () => {
	return (
		<VStack py={20} bg="white" h="100%" minH="100vh">
			<VStack gap={24}>
				<Heading color="#041E44" fontSize="46px" fontWeight="bold" lineHeight={'61.18px'}>
					AttendiT
				</Heading>
				<Flex justify="center" className="bouncing-loader">
					<Box boxSize={6} />
					<Box boxSize={6} />
					<Box boxSize={6} />
				</Flex>
			</VStack>
		</VStack>
	);
};

export default Loader;
