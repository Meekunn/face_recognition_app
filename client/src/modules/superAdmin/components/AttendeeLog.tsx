import {
	Avatar,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Table,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	VStack,
} from '@chakra-ui/react';
import { IAttendeeLog } from '../types';

interface IAttendeeLogModal {
	isOpen: boolean;
	onClose: () => void;
	name: string;
	picture: string;
	logs: IAttendeeLog[];
}

const AttendeeLog = ({ isOpen, onClose, name, picture, logs }: IAttendeeLogModal) => {
	const enterLogs = logs.filter((log) => log.action === 'enter');
	const leaveLogs = logs.filter((log) => log.action === 'leave');

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent p={4}>
				<ModalHeader textAlign={'center'} fontSize={'2xl'}>
					Logs for {name}
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack gap={6}>
						<VStack alignItems="center" gap={3}>
							<Avatar src={`http://localhost:8080/uploads/${picture}`} size={'2xl'} />
						</VStack>
						<Table variant="striped" colorScheme="customBlue">
							<Thead>
								<Tr>
									<Th fontSize="sm" fontWeight={'bold'}>
										Enter
									</Th>
									<Th fontSize="sm" fontWeight={'bold'} textAlign={'right'}>
										Leave
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{enterLogs.map((log, index) => (
									<Tr key={log.log_id}>
										<Td color="green">{log.timestamp}</Td>
										<Td color="red" textAlign="right">
											{leaveLogs[index] ? leaveLogs[index].timestamp : ''}
										</Td>
									</Tr>
								))}
								{leaveLogs.length > enterLogs.length &&
									leaveLogs.slice(enterLogs.length).map((log) => (
										<Tr key={log.log_id}>
											<Td color="red"></Td>
											<Td color="red">{log.timestamp}</Td>
										</Tr>
									))}
							</Tbody>
						</Table>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme="customBlue" mr={3} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AttendeeLog;
