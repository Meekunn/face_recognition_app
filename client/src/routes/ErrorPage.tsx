import { Flex, Heading, Image, Text, VStack, Box, Button } from '@chakra-ui/react';
import errorIcon from '../assets/icons/error.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { superAdminPaths } from './paths';
import { navigateBackToRoot } from '../utils/routeManager';

const ErrorPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const previousPath = location.state ? navigateBackToRoot(location.state.from) : '/';
	return (
		<VStack py={20} bg="white" h="100%" minH="100vh">
			<VStack gap={20}>
				<Flex direction="column" gap={4} align="center">
					<Heading as="h1" fontSize="5xl" fontFamily={"'Pacifico', cursive"} color="brand.textDark" mt={4}>
						At<span style={{ color: '#0050C8' }}>tend</span>iT
					</Heading>
					<Text color="brand.textDark" fontSize="23px">
						Something went wrong
					</Text>
				</Flex>
				<Flex align="center" h="236px" w="236px">
					<Image src={errorIcon} />
				</Flex>
				<Flex direction="column" gap={4} align="center">
					<Flex gap={2} direction="column" align="center" w="287px">
						<Heading color="#041E44" fontSize="46px" fontWeight="bold" lineHeight={'61.18px'}>
							404
						</Heading>
						<Text color="#393A4A" fontSize="sm" textAlign={'center'}>
							You currently do not have any response yet. Advise on link sharing goes here.
						</Text>
					</Flex>
					<Flex gap={2} align="center">
						<Button
							onClick={() => navigate(previousPath)}
							bg="transparent"
							fontSize="sm"
							color="brand.primary"
							px={2}
							_hover={{ bg: 'transparent', color: 'brand.textDark' }}
							_active={{ bg: 'transparent' }}
						>
							Go back
						</Button>
						<Box w="1px" h="11px" bg="brand.primary" />
						<Button
							onClick={() => navigate(superAdminPaths.EVENTS)}
							bg="transparent"
							fontSize="sm"
							color="brand.primary"
							px={2}
							_hover={{ bg: 'transparent', color: 'brand.textDark' }}
							_active={{ bg: 'transparent' }}
						>
							Events
						</Button>
						{/* <Box w="1px" h="11px" bg="brand.primary" />
						<Button
							bg="transparent"
							fontSize="sm"
							color="brand.primary"
							px={2}
							_hover={{ bg: 'transparent', color: 'brand.textDark' }}
							_active={{ bg: 'transparent' }}
						>
							Report
						</Button> */}
					</Flex>
				</Flex>
			</VStack>
		</VStack>
	);
};

export default ErrorPage;
