import { useToast, Box, UseToastOptions } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { AiOutlineCheckCircle, AiOutlineWarning, AiOutlineCloseCircle } from 'react-icons/ai';

interface UseCustomToastProps extends UseToastOptions {
	//message?: string;
	status?: 'success' | 'warning' | 'error';
	bg?: string;
	color?: string;
}

const useCustomToast = () => {
	const toast = useToast();

	const showToast = ({
		//message = 'Hello World',
		position = 'top-right',
		bg,
		color = 'white',
		duration = 5000,
		isClosable = true,
		status,
		title,
		description,
		...rest
	}: UseCustomToastProps) => {
		let icon: IconType;
		let backgroundColor: string;

		switch (status) {
			case 'success':
				icon = AiOutlineCheckCircle;
				backgroundColor = '#0050C8';
				break;
			case 'warning':
				icon = AiOutlineWarning;
				backgroundColor = 'yellow.500';
				break;
			case 'error':
				icon = AiOutlineCloseCircle;
				backgroundColor = 'red.500';
				break;
			default:
				icon = AiOutlineCheckCircle;
				backgroundColor = bg || 'blue.500';
		}

		toast({
			position,
			duration,
			isClosable,
			title,
			description,
			...rest,
			render: () => (
				<Box color={color} p={3} bg={backgroundColor} display="flex" alignItems="center" borderRadius={'15px'}>
					<Box as={icon} mr={2} fontSize={'2xl'} />
					<Box>
						{title && <Box fontWeight="bold">{title}</Box>}
						{description}
					</Box>
				</Box>
			),
		});
	};

	return showToast;
};

export default useCustomToast;
