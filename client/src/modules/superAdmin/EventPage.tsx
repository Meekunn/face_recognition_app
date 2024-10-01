import { Avatar, IconButton, VStack, useDisclosure } from '@chakra-ui/react';
import NavCrumbBar from '../../reusables/NavCrumbBar';
import CustomTable from '../../reusables/CustomTable';
import { superAdminPaths } from '../../routes/paths';
import { useEffect, useState } from 'react';
import { IInvitee } from './types';
import { useParams } from 'react-router-dom';
import Api from '../../api';
import { createColumnHelper } from '@tanstack/react-table';
import { FiTrash2 } from 'react-icons/fi';
import CustomModal from '../../reusables/Feedbacks/CustomModal';
import useCustomToast from '../../hooks/useCustomToast';

const columnHelper = createColumnHelper<IInvitee>();

const EventPage = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showToast = useCustomToast();
	const { id } = useParams<{ id: string }>();
	const [invitees, setInvitees] = useState<IInvitee[]>([]);
	const [eventName, setEventName] = useState('');
	const [selectedInviteeId, setSelectedInviteeId] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvitees = async () => {
			try {
				const response = await Api.get(`get-invitees/${id}`);
				setInvitees(response.data.invitees);
				setEventName(response.data.event_name);
			} catch (error) {
				console.log(error);
			}
		};

		fetchInvitees();
	}, [id]);

	const crumbItems: ICrumbItems[] = [
		{
			name: 'Events',
			path: superAdminPaths.EVENTS,
		},
		{
			name: `${eventName} Invitees`,
			path: id ? superAdminPaths.EVENT.replace(':id', id) : '#',
		},
	];

	const handleDeleteInvitee = async () => {
		if (selectedInviteeId) {
			try {
				// const response =
				await Api.delete('delete-invitee', {
					data: { invitee_id: selectedInviteeId },
				});
				// console.log(response.data);
				showToast({
					description: 'Invitee deleted successfully',
					status: 'success',
				});
				setInvitees((prevData) => prevData.filter((invitee) => invitee.invitee_id !== selectedInviteeId));
			} catch (error) {
				// console.error('There was an error deleting the invitee!', error);
				showToast({
					title: 'Failed to delete invitee.',
					description: 'There was an error deleting the invitee.',
					status: 'error',
				});
			} finally {
				onClose();
			}
		}
	};

	const handleDeleteClick = (invitee_id: string) => {
		setSelectedInviteeId(invitee_id);
		onOpen();
	};

	const columns = [
		columnHelper.display({
			id: 'serialNumber',
			header: () => 'S/N',
			cell: (info) => info.row.index + 1,
		}),
		columnHelper.accessor('photo', {
			header: () => 'Picture',
			cell: (info) => {
				return <Avatar size="sm" src={`http://localhost:5000/uploads/${id}/${info.getValue()}`} />;
			},
		}),
		columnHelper.accessor('name', {
			header: () => 'Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('invitee_id', {
			cell: (info) => info.getValue(),
			header: () => 'UID',
		}),
		columnHelper.accessor('phone_number', {
			header: () => 'Phone Number',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: (info) => {
				const invitee_id = info.row.original.invitee_id;
				return (
					<IconButton
						aria-label="delete invitee"
						colorScheme="red"
						onClick={() => handleDeleteClick(invitee_id!)}
						variant="ghost"
						fontSize="xl"
					>
						<FiTrash2 />
					</IconButton>
				);
			},
		}),
	];

	return (
		<>
			<NavCrumbBar crumbItems={crumbItems} />
			<VStack w="full" p={8}>
				<CustomTable data={invitees} columns={columns} placeholderText="Search Invitee" />
			</VStack>

			<CustomModal
				isAction={true}
				title="Confirm Deletion"
				description="Are you sure you want to delete this invitee? This action cannot be undone."
				action={handleDeleteInvitee}
				isOpen={isOpen}
				onClose={onClose}
				actionBtnText="Delete"
				status="warning"
			/>
		</>
	);
};

export default EventPage;
