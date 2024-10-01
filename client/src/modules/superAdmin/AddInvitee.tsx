import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Flex, HStack, IconButton, Select, VStack, useDisclosure } from '@chakra-ui/react';
import NavCrumbBar from '../../reusables/NavCrumbBar';
import { superAdminPaths } from '../../routes/paths';
import { IoPersonAdd } from 'react-icons/io5';
import AddInviteeForm from './components/AddInviteeForm';
import { createColumnHelper } from '@tanstack/react-table';
import { FiTrash2 } from 'react-icons/fi';
import CustomTable from '../../reusables/CustomTable';
import { IEvent, IInvitee } from './types';
import Api from '../../api';
import { useNavigate } from 'react-router-dom';
import useCustomToast from '../../hooks/useCustomToast';
import { selectOrganisation } from '../../features/organisation/organisationSlice';
import { useSelector } from 'react-redux';

const crumbItems: ICrumbItems[] = [
	{
		name: 'Add Invitees',
		path: superAdminPaths.ADD_INVITEES,
	},
];

const columnHelper = createColumnHelper<IInvitee>();

const AddInvitee = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const navigate = useNavigate();
	const showToast = useCustomToast();
	const organisation = useSelector(selectOrganisation);

	const [data, setData] = useState<IInvitee[]>([]);
	const [events, setEvents] = useState<IEvent[]>([]);
	// const [inviteeIds, setInviteeIds] = useState<string[]>([]);
	const [selectedEvent, setSelectedEvent] = useState('');

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await Api.get(`get-events/${organisation.id}`);
				setEvents(response.data);
			} catch (error) {
				// console.log(error);
				showToast({
					title: 'Error Occurred.',
					description: 'An error occured while fetching events.',
					status: 'error',
					duration: 5000,
				});
			}
		};

		fetchEvents();
	}, [organisation.id]);

	const handleAddInvitee = (newInvitee: IInvitee) => {
		setData((prevData) => [...prevData, newInvitee]);

		// if (newInvitee.invitee_id) {
		// 	setInviteeIds((prevData) => [...prevData, newInvitee.invitee_id!]);
		// }
	};

	console.log(data);

	const handleDeleteInvitee = (rowIndex: number) => {
		setData((prevData) => prevData.filter((_, index) => index !== rowIndex));
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
				return <Avatar size="sm" src={info.getValue()} />;
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
				const handleDelete = async () => {
					handleDeleteInvitee(info.row.index);
					const invitee_id = info.row.original.invitee_id;
					try {
						// const response =
						// await Api.delete('/delete-invitee', {
						// 	data: { invitee_id: invitee_id },
						// });
						// console.log(response.data);
						showToast({
							//title: 'New Event created.',
							description: 'Invitee deleted successfully',
							status: 'success',
							duration: 5000,
						});
						setData((prevData: IInvitee[]) => prevData.filter((invitee: IInvitee) => invitee.invitee_id !== invitee_id));
						// setInviteeIds((prevData: string[]) => prevData.filter((inviteeId: string) => inviteeId !== invitee_id));
					} catch (error) {
						// console.error('There was an error deleting the invitee!', error);
						showToast({
							title: 'Failed to delete invitee.',
							description: 'There was an error deleting the invitee.',
							status: 'error',
						});
					}
				};
				return (
					<IconButton aria-label="delete invitee" colorScheme="red" onClick={handleDelete} variant="ghost" fontSize="xl">
						<FiTrash2 />
					</IconButton>
				);
			},
		}),
	];

	const handleLinkToEvent = async () => {
		// console.log(inviteeIds);

		try {
			// Loop through the invitee IDs array
			for (const invitee of data) {
				const formData = new FormData();

				// Append event and invitee details to the form data
				formData.append('event_id', selectedEvent);
				formData.append('invitee_id', invitee.invitee_id!);
				formData.append('name', invitee.name);
				formData.append('phone_number', invitee.phone_number);
				formData.append('photo', invitee.photoFile!);

				// Assuming invitee.photo contains the File object for the invitee's photo
				// if (invitee.photo) {
				// 	formData.append('photo', invitee.photo); // 'photo' key to match backend API
				// }

				// Make API request for each invitee
				await Api.post('add-invitee', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
			}
			// console.log(response.data);
			showToast({
				title: 'Invitees Added',
				description: "We've linked the invitees to event",
				status: 'success',
			});
			setTimeout(() => {
				navigate(superAdminPaths.EVENT.replace(':id', selectedEvent!.toString()));
			}, 2000);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.log(error);
			showToast({
				title: 'Error Occurred.',
				description: 'An error occured when linking to event',
				status: 'error',
				duration: 5000,
			});
		}
	};

	return (
		<>
			<NavCrumbBar crumbItems={crumbItems} />
			<VStack w="full" p={8} gap={8}>
				<HStack justify={'space-between'} w="full" align="center">
					<Box width="230px">
						<Select placeholder="Select event" required value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
							{events.map((event) => (
								<option value={event.event_id} key={event.event_id}>
									{event.event_name}
								</option>
							))}
						</Select>
					</Box>
					<Button leftIcon={<IoPersonAdd />} onClick={onOpen}>
						Add Invitee
					</Button>
				</HStack>
				<CustomTable columns={columns} data={data} showSearchBox={false} />
			</VStack>
			<Flex align="center" justify="flex-end" p={8} pr={16}>
				<Button isDisabled={data.length == 0} onClick={handleLinkToEvent}>
					Register with Event
				</Button>
			</Flex>

			<AddInviteeForm isOpen={isOpen} onClose={onClose} onAddInvitee={handleAddInvitee} />
		</>
	);
};

export default AddInvitee;
