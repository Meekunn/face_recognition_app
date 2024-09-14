import {
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Flex,
	Icon,
	Heading,
	Text,
} from '@chakra-ui/react';
import { FaFaceFlushed } from 'react-icons/fa6';
import { FaFaceGrinBeamSweat } from 'react-icons/fa6';

interface IModal {
	isAction: boolean;
	title: string;
	description: string;
	action?: () => void;
	isOpen: boolean;
	onClose: () => void;
	actionBtnText: string;
	status?: 'default' | 'warning';
}

const CustomModal = ({
	isAction = false,
	title,
	actionBtnText,
	description,
	action,
	isOpen,
	onClose,
	status = 'default',
}: IModal) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent p={7}>
				<ModalHeader>
					<Flex direction={'column'} gap={5} align={'center'}>
						<Icon
							as={status == 'default' ? FaFaceGrinBeamSweat : FaFaceFlushed}
							w={12}
							h={12}
							color={status == 'default' ? 'brand.primary' : 'customRed.500'}
						/>
						<Heading as="h2" fontSize={'2xl'}>
							{' '}
							{title}
						</Heading>
					</Flex>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Text textAlign={'center'} fontSize={'md'}>
						{description}
					</Text>
				</ModalBody>
				<ModalFooter>
					<Button
						variant="ghost"
						border={'1px solid darkgray'}
						borderRadius={'6px'}
						mr={3}
						onClick={onClose}
						color={'black'}
						fontWeight="semibold"
					>
						Close
					</Button>
					{isAction && (
						<Button colorScheme={status == 'default' ? 'customBlue' : 'customRed'} onClick={action} fontWeight="semibold">
							{actionBtnText}
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default CustomModal;
